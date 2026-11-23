import type { APIRoute } from 'astro';
import { getDailyAuditPayload, getDatabaseUrl } from '../../lib/db';
import { getUtcDateString } from '../../lib/prng';

export const GET: APIRoute = async ({ url, locals }) => {
  const dateParam = url.searchParams.get('date');
  const auditDate =
    dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
      ? dateParam
      : getUtcDateString();

  const databaseUrl = getDatabaseUrl(locals);
  const payload = await getDailyAuditPayload(auditDate, databaseUrl);

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // Edge-cache on Cloudflare CDN for 1h with 24h stale-while-revalidate
      'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
};
