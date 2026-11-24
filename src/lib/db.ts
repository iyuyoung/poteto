import { neon } from '@neondatabase/serverless';
import {
  OFFICIAL_DECOY_DRAWING,
  SEED_POTATO_DRAWINGS,
  STAGE1_PROMPTS,
  STAGE2_GAMES,
  STAGE3_PROMPTS,
} from './catalog';
import {
  createSeededRng,
  getAuditNumber,
  getUtcDateString,
  getYesterdayUtcDateString,
  seededShuffle,
} from './prng';
import type {
  DailyAuditPayload,
  PotatoDrawing,
  PotatoPathData,
  YesterdayHookPayload,
} from './types';

interface MemoryDrawing {
  id: string;
  clientId: string;
  auditDate: string;
  promptId: string;
  pathData: PotatoPathData;
  status: 'pending' | 'approved' | 'hidden';
  fooledCount: number;
  reportCount: number;
}

// Lightweight in-memory fallback for local dev / demo without DATABASE_URL
const memoryDrawings: MemoryDrawing[] = [];
const memoryReports = new Map<string, number>();
const memoryVotes = new Map<string, number>();

export function getDatabaseUrl(locals?: App.Locals): string | undefined {
  const cfEnv = (locals as unknown as { runtime?: { env?: Record<string, string> } })?.runtime?.env;
  return cfEnv?.DATABASE_URL || import.meta.env.DATABASE_URL || process.env.DATABASE_URL;
}

export function getCronSecret(locals?: App.Locals): string | undefined {
  const cfEnv = (locals as unknown as { runtime?: { env?: Record<string, string> } })?.runtime?.env;
  return cfEnv?.CRON_SECRET || import.meta.env.CRON_SECRET || process.env.CRON_SECRET;
}

export function pickDailyPrompts(auditDate: string) {
  const auditNumber = getAuditNumber(auditDate);
  const stage1Prompt = STAGE1_PROMPTS[(auditNumber - 1) % STAGE1_PROMPTS.length];
  // Modulo over 16 micro-games ensures zero repeats across 16 consecutive days (> 7 days guarantee)
  const stage2Game = STAGE2_GAMES[(auditNumber - 1) % STAGE2_GAMES.length];
  const stage3Prompt = STAGE3_PROMPTS[(auditNumber - 1) % STAGE3_PROMPTS.length];
  return { auditNumber, stage1Prompt, stage2Game, stage3Prompt };
}

export async function getDailyAuditPayload(
  auditDate: string = getUtcDateString(),
  databaseUrl?: string
): Promise<DailyAuditPayload> {
  const { auditNumber, stage1Prompt, stage2Game, stage3Prompt } = pickDailyPrompts(auditDate);
  const seed = `poteto-${auditDate}`;
  const rng = createSeededRng(seed);

  let approvedDrawings: PotatoDrawing[] = [];
  let source: 'neon' | 'seed' = 'seed';

  if (databaseUrl) {
    try {
      const sql = neon(databaseUrl);
      const poolRows = await sql`
        SELECT featured_drawing_ids, stage2_game_id, stage3_prompt_id
        FROM daily_pools
        WHERE audit_date = ${auditDate}
        LIMIT 1
      `;

      if (poolRows.length > 0 && Array.isArray(poolRows[0].featured_drawing_ids) && poolRows[0].featured_drawing_ids.length > 0) {
        const ids = poolRows[0].featured_drawing_ids as string[];
        const rows = await sql`
          SELECT id, prompt_id, audit_date::text, path_data, fooled_count
          FROM potato_drawings
          WHERE id = ANY(${ids}::uuid[])
            AND status = 'approved'
        `;
        approvedDrawings = rows.map((r) => ({
          id: String(r.id),
          promptId: String(r.prompt_id),
          auditDate: String(r.audit_date),
          pathData: r.path_data as PotatoPathData,
          fooledCount: Number(r.fooled_count ?? 0),
          authorTag: 'Anonymous Human',
        }));
        source = 'neon';
      } else {
        // Fallback query: grab latest approved drawings from Neon if daily_pools not pre-populated yet
        const rows = await sql`
          SELECT id, prompt_id, audit_date::text, path_data, fooled_count
          FROM potato_drawings
          WHERE status = 'approved'
          ORDER BY created_at DESC
          LIMIT 16
        `;
        if (rows.length >= 8) {
          approvedDrawings = rows.map((r) => ({
            id: String(r.id),
            promptId: String(r.prompt_id),
            auditDate: String(r.audit_date),
            pathData: r.path_data as PotatoPathData,
            fooledCount: Number(r.fooled_count ?? 0),
            authorTag: 'Anonymous Human',
          }));
          source = 'neon';
        }
      }
    } catch (err) {
      console.error('[poteto] Neon query fallback to seed pool:', err);
    }
  }

  // Merge seed drawings so we always have at least 8 featured + 4 reserve
  const visibleSeeds = SEED_POTATO_DRAWINGS.filter((d) => (memoryReports.get(d.id) ?? 0) < 3).map((d) => ({
    ...d,
    fooledCount: (d.fooledCount ?? 0) + (memoryVotes.get(d.id) ?? 0),
  }));

  const combined = [...approvedDrawings, ...visibleSeeds];
  const shuffled = seededShuffle(combined, rng);
  const eightUgc = shuffled.slice(0, 8);
  const reserveDrawings = shuffled.slice(8, 14);

  // Insert 1 official decoy into the 9-cell grid at deterministic position
  const decoyPos = Math.floor(rng() * 9);
  const featuredDrawings: PotatoDrawing[] = [...eightUgc];
  featuredDrawings.splice(decoyPos, 0, {
    ...OFFICIAL_DECOY_DRAWING,
    auditDate,
  });

  return {
    auditDate,
    auditNumber,
    seed,
    stage1Prompt,
    stage2Game,
    stage3Prompt,
    featuredDrawings,
    reserveDrawings,
    source,
  };
}

export async function savePotatoDrawing(
  params: {
    clientId: string;
    auditDate: string;
    promptId: string;
    pathData: PotatoPathData;
  },
  databaseUrl?: string
): Promise<{ id: string; storedIn: 'neon' | 'memory' }> {
  if (databaseUrl) {
    try {
      const sql = neon(databaseUrl);
      const rows = await sql`
        INSERT INTO potato_drawings (client_id, audit_date, prompt_id, path_data, status)
        VALUES (${params.clientId}, ${params.auditDate}, ${params.promptId}, ${JSON.stringify(params.pathData)}::jsonb, 'pending')
        RETURNING id
      `;
      if (rows.length > 0) {
        return { id: String(rows[0].id), storedIn: 'neon' };
      }
    } catch (err) {
      console.error('[poteto] Failed to insert drawing into Neon:', err);
    }
  }

  const id = `local-${crypto.randomUUID()}`;
  memoryDrawings.push({
    id,
    clientId: params.clientId,
    auditDate: params.auditDate,
    promptId: params.promptId,
    pathData: params.pathData,
    status: 'pending',
    fooledCount: 0,
    reportCount: 0,
  });
  return { id, storedIn: 'memory' };
}

export async function recordDrawingVotes(
  drawingIds: string[],
  databaseUrl?: string
): Promise<void> {
  if (!drawingIds.length) return;

  if (databaseUrl) {
    const uuids = drawingIds.filter((id) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    );
    if (uuids.length > 0) {
      try {
        const sql = neon(databaseUrl);
        await sql`
          UPDATE potato_drawings
          SET fooled_count = fooled_count + 1
          WHERE id = ANY(${uuids}::uuid[])
        `;
      } catch (err) {
        console.error('[poteto] Failed to record votes in Neon:', err);
      }
    }
  }

  for (const id of drawingIds) {
    memoryVotes.set(id, (memoryVotes.get(id) ?? 0) + 1);
  }
}

export async function reportDrawing(
  drawingId: string,
  databaseUrl?: string
): Promise<{ reportCount: number; hidden: boolean }> {
  if (
    databaseUrl &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(drawingId)
  ) {
    try {
      const sql = neon(databaseUrl);
      const rows = await sql`
        UPDATE potato_drawings
        SET
          report_count = report_count + 1,
          status = CASE WHEN report_count + 1 >= 3 THEN 'hidden' ELSE status END
        WHERE id = ${drawingId}::uuid
        RETURNING report_count, status
      `;
      if (rows.length > 0) {
        const count = Number(rows[0].report_count ?? 1);
        return { reportCount: count, hidden: rows[0].status === 'hidden' };
      }
    } catch (err) {
      console.error('[poteto] Failed to report drawing in Neon:', err);
    }
  }

  const next = (memoryReports.get(drawingId) ?? 0) + 1;
  memoryReports.set(drawingId, next);
  return { reportCount: next, hidden: next >= 3 };
}

export async function getYesterdayHook(
  clientId: string,
  databaseUrl?: string
): Promise<YesterdayHookPayload> {
  const yesterday = getYesterdayUtcDateString();

  if (databaseUrl && clientId) {
    try {
      const sql = neon(databaseUrl);
      const rows = await sql`
        SELECT audit_date::text, prompt_id, fooled_count, path_data
        FROM potato_drawings
        WHERE client_id = ${clientId}
          AND audit_date = ${yesterday}
        ORDER BY created_at DESC
        LIMIT 1
      `;
      if (rows.length > 0) {
        const row = rows[0];
        const count = Number(row.fooled_count ?? 0);
        const displayCount = count > 0 ? count : 19;
        const promptObj = STAGE3_PROMPTS.find((p) => p.id === row.prompt_id);
        return {
          hasYesterday: true,
          auditDate: String(row.audit_date),
          fooledCount: displayCount,
          promptTitle: promptObj?.title,
          drawing: row.path_data as PotatoPathData,
          message:
            count > 0
              ? `Your potato doodle successfully gaslit ${displayCount} humans last night.`
              : `Your potato doodle was voted "Most Existentially Exhausted" by ${displayCount} humans.`,
        };
      }
    } catch (err) {
      console.error('[poteto] Failed to query yesterday hook:', err);
    }
  }

  const localMatch = memoryDrawings.find(
    (d) => d.clientId === clientId && d.auditDate === yesterday
  );
  if (localMatch) {
    const fooled = Math.max(19, localMatch.fooledCount);
    return {
      hasYesterday: true,
      auditDate: yesterday,
      fooledCount: fooled,
      drawing: localMatch.pathData,
      message: `Your potato doodle successfully gaslit ${fooled} humans last night.`,
    };
  }

  return { hasYesterday: false, fooledCount: 0 };
}
