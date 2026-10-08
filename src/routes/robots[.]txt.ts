import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/robots.txt')({
  server: { handlers: {
    GET: ({ request }) => {
      const origin = (process.env.SITE_URL || new URL(request.url).origin).replace(/\/$/, '')
      const body = 'User-agent: *\nAllow: /\nDisallow: /search\nSitemap: ' + origin + '/sitemap.xml\n'
      return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } })
    },
  }},
})
