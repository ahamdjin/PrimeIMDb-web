import { createFileRoute } from '@tanstack/react-router'
import { trending, discover, genres } from '../lib/tmdb'
export const Route = createFileRoute('/sitemap.xml')({
  server: { handlers: {
    GET: async ({ request }) => {
      const origin = (process.env.SITE_URL || new URL(request.url).origin).replace(/\/$/, '')
      const routes = new Set(['/', '/movies', '/tv', '/free-movies', '/genres', '/about'])
      const [films, shows, open, categories] = await Promise.all([
        trending('movie'), trending('tv'), discover('movie', { free: true }), genres('movie'),
      ])
      for (const item of [...films, ...shows, ...open.items]) {
        if (item.id > 0 && item.poster && item.overview && item.votes > 20)
          routes.add('/' + item.kind + '/' + item.id)
      }
      for (const genre of categories) if (Number.isInteger(genre.id)) routes.add('/genre/' + genre.id)
      const escape = (value: string) => value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
      const body = '<?xml version="1.0" encoding="UTF-8"?>' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
        [...routes].map(path => '<url><loc>' + escape(origin + path) + '</loc></url>').join('') +
        '</urlset>'
      return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } })
    },
  }},
})
