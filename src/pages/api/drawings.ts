import type { APIRoute } from 'astro';
import { getDatabaseUrl, savePotatoDrawing } from '../../lib/db';
import { getUtcDateString } from '../../lib/prng';
import { estimateJsonBytes, validatePotatoDrawing } from '../../lib/rdp';
import type { PotatoPathData } from '../../lib/types';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = (await request.json()) as {
      clientId?: string;
      promptId?: string;
      auditDate?: string;
      pathData?: PotatoPathData;
    };

    const clientId = String(body.clientId ?? '').trim().slice(0, 64);
    const promptId = String(body.promptId ?? '').trim().slice(0, 32);
    const auditDate =
      body.auditDate && /^\d{4}-\d{2}-\d{2}$/.test(body.auditDate)
        ? body.auditDate
        : getUtcDateString();

    if (!clientId || !promptId || !body.pathData) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing required fields (clientId / promptId / pathData).' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const bytes = estimateJsonBytes(body.pathData);
    if (bytes > 2048) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Vector payload exceeds 2KB limit.' }),
        { status: 413, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const validation = validatePotatoDrawing(body.pathData);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ ok: false, error: validation.reason }),
        { status: 422, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const databaseUrl = getDatabaseUrl(locals);
    const saved = await savePotatoDrawing(
      { clientId, auditDate, promptId, pathData: body.pathData },
      databaseUrl
    );

    return new Response(
      JSON.stringify({
        ok: true,
        id: saved.id,
        storedIn: saved.storedIn,
        bytes,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[poteto] POST /api/drawings error:', err);
    return new Response(
      JSON.stringify({ ok: false, error: 'Submission failed. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
