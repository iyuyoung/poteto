import type { APIRoute } from 'astro';
import { getDatabaseUrl, getYesterdayHook } from '../../lib/db';

export const GET: APIRoute = async ({ url, locals }) => {
  const clientId = String(url.searchParams.get('clientId') ?? '').trim().slice(0, 64);
  if (!clientId) {
    return new Response(JSON.stringify({ hasYesterday: false, fooledCount: 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const payload = await getYesterdayHook(clientId, getDatabaseUrl(locals));
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, max-age=60',
    },
  });
};
