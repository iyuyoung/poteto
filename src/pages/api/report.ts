import type { APIRoute } from 'astro';
import { getDatabaseUrl, reportDrawing } from '../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = (await request.json()) as { drawingId?: string };
    const drawingId = String(body.drawingId ?? '').trim().slice(0, 64);

    if (!drawingId) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing drawingId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await reportDrawing(drawingId, getDatabaseUrl(locals));
    return new Response(JSON.stringify({ ok: true, ...result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
