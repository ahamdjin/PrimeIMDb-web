import type { Movie } from './tmdb'
export function siteOrigin() {
  const configured = import.meta.env.VITE_SITE_URL as string | undefined
  if (!configured) return null
  try { const origin = new URL(configured).origin; return origin.startsWith('https://') ? origin : null }
  catch { return null }
}
export function canonical(pathname: string) {
  const origin = siteOrigin()
  return origin ? [{ rel: 'canonical' as const, href: origin + pathname }] : []
}
export function schema(data: object) {
  return [{ type: 'application/ld+json', children: JSON.stringify(data).replace(/</g, '\\u003c') }]
}
export function movieSchema(movie: Movie) {
  const base: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': movie.kind === 'tv' ? 'TVSeries' : 'Movie',
    name: movie.title, datePublished: movie.release, image: movie.poster || undefined,
    description: movie.overview || undefined, inLanguage: movie.originalLanguage,
    genre: movie.genres.map(g => g.name),
    url: siteOrigin() ? siteOrigin() + '/' + movie.kind + '/' + movie.id : undefined,
    actor: movie.cast?.slice(0, 10).map(p => ({ '@type': 'Person', name: p.name })),
    director: movie.directors?.map(p => ({ '@type': 'Person', name: p.name })),
  }
  if (movie.rating > 0 && movie.votes > 0) {
    base.aggregateRating = {
      '@type': 'AggregateRating', ratingValue: Number(movie.rating.toFixed(1)),
      ratingCount: movie.votes, bestRating: 10, worstRating: 0,
      ratingExplanation: 'TMDB community ratings',
    }
  }
  return base
}
export function movieMeta(movie: Movie) {
  const title = movie.title + (movie.year ? ' (' + movie.year + ')' : '') + ' — Cast, Ratings & Where to Watch | Prime IMDb'
  const description = (movie.overview || 'Explore ' + movie.title + ', its cast, credits and viewing options.').slice(0, 155)
  return [
    { title },
    { name: 'description', content: description },
    { property: 'og:type', content: 'video.movie' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    ...(movie.backdrop || movie.poster ? [{ property: 'og:image', content: (movie.backdrop || movie.poster)! }] : []),
    { name: 'twitter:card', content: 'summary_large_image' },
  ]
}
