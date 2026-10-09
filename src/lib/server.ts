import { createServerFn } from '@tanstack/react-start'
import { trending, discover, search, details, providers, genres, person, hasCatalogCredentials, type Kind } from './tmdb'
import { watchmodeSources } from './watchmode'
export const getHome = createServerFn({ method: 'GET' }).handler(async () => {
  const [trendingToday, trendingWeek, popularMovies, tv, free, upcoming, movieGenres] = await Promise.all([
    trending('movie', 'day'), trending('movie', 'week'),
    discover('movie'), trending('tv', 'week'), discover('movie', { free:true }),
    discover('movie', { upcoming:true }), genres('movie'),
  ])
  return {
    movies: trendingWeek, trendingToday, popularMovies: popularMovies.items,
    tv, free: free.items, upcoming: upcoming.items,
    movieGenres, configured: hasCatalogCredentials(),
  }
})
type BrowseInput = { kind: Kind; page?: number; genre?: number; free?: boolean; region?: string }
export const getBrowse = createServerFn({ method: 'GET' })
  .validator((v: BrowseInput) => {
    if (!v || (v.kind !== 'movie' && v.kind !== 'tv')) throw new Error('Invalid catalog type')
    return {
      kind: v.kind,
      page: Math.max(1, Math.min(500, Math.floor(Number(v.page) || 1))),
      genre: Number.isSafeInteger(v.genre) && Number(v.genre) > 0 ? v.genre : undefined,
      free: v.free === true,
      region: typeof v.region === 'string' && /^[A-Z]{2}$/.test(v.region) ? v.region : 'US',
    }
  }).handler(({ data }) => discover(data.kind, data))
export const getSearch = createServerFn({ method: 'GET' })
  .validator((v: { q: string }) => {
    if (typeof v?.q !== 'string') throw new Error('Invalid search')
    return { q: v.q.trim().slice(0, 100) }
  }).handler(({ data }) => search(data.q))
export const getDetails = createServerFn({ method: 'GET' })
  .validator((v: { kind: Kind; id: number; region?: string }) => {
    if (!v || (v.kind !== 'movie' && v.kind !== 'tv') || !Number.isSafeInteger(v.id) || v.id <= 0)
      throw new Error('Invalid media identifier')
    return { kind: v.kind, id: v.id, region: typeof v.region === 'string' && /^[A-Z]{2}$/.test(v.region) ? v.region : 'US' }
  }).handler(async ({ data }) => {
    const [item, where, watchmode] = await Promise.all([
      details(data.kind, data.id),
      providers(data.kind, data.id, data.region),
      watchmodeSources(data.kind, data.id, data.region),
    ])
    return { item, where, watchmode }
  })
export const getGenres = createServerFn({ method: 'GET' }).handler(() => genres('movie'))
export const getPerson = createServerFn({ method: 'GET' })
  .validator((v: { id: number }) => {
    if (!Number.isSafeInteger(v?.id) || v.id <= 0) throw new Error('Invalid person ID')
    return v
  }).handler(({ data }) => person(data.id))
