import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  if (context.url.pathname === '/llms.txt' || context.url.pathname === '/robots.txt') {
    const headers = new Headers(response.headers);
    headers.set('Content-Type', 'text/plain; charset=utf-8');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
  return response;
});
