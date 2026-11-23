import type { APIRoute } from 'astro';
import { neon } from '@neondatabase/serverless';
import { getCronSecret, getDatabaseUrl, pickDailyPrompts } from '../../../lib/db';
import { getUtcDateString } from '../../../lib/prng';

/**
 * Daily Curation Endpoint (Layer 2 Safety Net):
 * Samples up to 15 pending drawings from yesterday, approves them, and writes tomorrow's daily_pools row.
 * For AI-assisted 5x6 grid visual moderation, run `scripts/daily-curate.mjs` via GitHub Actions / Cloudflare Cron.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const secret = getCronSecret(locals);
  const authHeader = request.headers.get('authorization');

  if (secret && authHeader !== `Bearer ${secret}`) {
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const databaseUrl = getDatabaseUrl(locals);
  if (!databaseUrl) {
    return new Response(
      JSON.stringify({ ok: true, mode: 'seed-only', message: 'DATABASE_URL unset; using curated seed pool.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const sql = neon(databaseUrl);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const targetDate = getUtcDateString(tomorrow);
    const { stage2Game, stage3Prompt } = pickDailyPrompts(targetDate);

    const candidates = await sql`
      SELECT id
      FROM potato_drawings
      WHERE status = 'pending' AND report_count < 3
      ORDER BY RANDOM()
      LIMIT 15
    `;

    const ids = candidates.map((r) => String(r.id));
    if (ids.length > 0) {
      await sql`
        UPDATE potato_drawings
        SET status = 'approved'
        WHERE id = ANY(${ids}::uuid[])
      `;
    }

    await sql`
      INSERT INTO daily_pools (audit_date, seed, stage2_game_id, stage3_prompt_id, featured_drawing_ids)
      VALUES (${targetDate}, ${`poteto-${targetDate}`}, ${stage2Game.id}, ${stage3Prompt.id}, ${ids}::uuid[])
      ON CONFLICT (audit_date)
      DO UPDATE SET
        featured_drawing_ids = EXCLUDED.featured_drawing_ids,
        stage2_game_id = EXCLUDED.stage2_game_id,
        stage3_prompt_id = EXCLUDED.stage3_prompt_id
    `;

    return new Response(
      JSON.stringify({ ok: true, targetDate, approvedCount: ids.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[poteto] Cron curate error:', err);
    return new Response(JSON.stringify({ ok: false, error: 'Curation failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
