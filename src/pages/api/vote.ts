import type { APIRoute } from 'astro';
import { getDatabaseUrl, recordDrawingVotes } from '../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = (await request.json()) as { drawingIds?: string[] };
    const ids = Array.isArray(body.drawingIds)
      ? body.drawingIds.map(String).slice(0, 9)
      : [];

    await recordDrawingVotes(ids, getDatabaseUrl(locals));

    return new Response(JSON.stringify({ ok: true, counted: ids.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
