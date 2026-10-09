export type Kind = 'movie' | 'tv'
export type Credit = { id: number; name: string; character?: string; profile_path?: string | null; job?: string }
export type Movie = {
  id: number; kind: Kind; title: string; originalTitle?: string; year: string; release?: string;
  overview: string; poster: string | null; backdrop: string | null; rating: number; votes: number;
  genres: { id: number; name: string }[]; runtime?: number; tagline?: string;
  originalLanguage?: string; status?: string; imdbId?: string;
  cast?: Credit[]; directors?: Credit[]; writers?: Credit[];
  trailers?: { key: string; name: string }[]; similar?: Movie[];
  seasons?: { id: number; name: string; season_number: number; episode_count: number }[];
  externalRatings?: { source: string; value: string }[]; awards?: string;
  tvStatus?: string; tvNetwork?: string
}
export type Provider = { provider_id: number; provider_name: string; logo_path: string }
export type Providers = { link?: string; free?: Provider[]; ads?: Provider[]; flatrate?: Provider[]; rent?: Provider[]; buy?: Provider[] }
export type Listing = { items: Movie[]; pages: number }
export const image = (path?: string | null, size = 'w500') =>
  path && path.startsWith('/') ? 'https://image.tmdb.org/t/p/' + size + path : null

const memory = new Map<string, { until: number; data: unknown }>()
async function cached<T>(key: string, ttl: number, request: () => Promise<T | null>): Promise<T | null> {
  const hit = memory.get(key)
  if (hit && hit.until > Date.now()) return hit.data as T | null
  const data = await request()
  if (data !== null) {
    if (memory.size > 500) memory.clear()
    memory.set(key, { until: Date.now() + ttl, data })
  }
  return data
}
export function hasCatalogCredentials() {
  return Boolean(process.env.TMDB_API_READ_TOKEN || process.env.TMDB_API_KEY)
}
async function query<T>(path: string, params: Record<string, string | number | undefined> = {}, ttl = 30 * 60_000): Promise<T | null> {
  const token = process.env.TMDB_API_READ_TOKEN
  const key = process.env.TMDB_API_KEY
  if (!token && !key) return null
  const url = new URL('https://api.themoviedb.org/3' + path)
  for (const [k, v] of Object.entries(params)) if (v !== undefined) url.searchParams.set(k, String(v))
  if (!token && key) url.searchParams.set('api_key', key)
  const cacheKey = url.pathname + '?' + url.searchParams.toString()
  return cached<T>(cacheKey, ttl, async () => {
    try {
      const response = await fetch(url, {
        headers: token ? { Authorization: 'Bearer ' + token, Accept: 'application/json' } : { Accept: 'application/json' },
        signal: AbortSignal.timeout(12_000),
      })
      return response.ok ? await response.json() as T : null
    } catch { return null }
  })
}
function normalized(input: any, kind: Kind): Movie {
  return {
    id: Number(input.id), kind, title: input.title || input.name || 'Untitled',
    originalTitle: input.original_title || input.original_name,
    year: String(input.release_date || input.first_air_date || '').slice(0, 4),
    release: input.release_date || input.first_air_date,
    overview: input.overview || '',
    poster: image(input.poster_path), backdrop: image(input.backdrop_path, 'w1280'),
    rating: Number(input.vote_average || 0), votes: Number(input.vote_count || 0),
    genres: input.genres || [], runtime: input.runtime || input.episode_run_time?.[0],
    tagline: input.tagline || '', originalLanguage: input.original_language,
    status: input.status, seasons: input.seasons,
  }
}
function entries(data: any, kind: Kind): Movie[] {
  return (Array.isArray(data?.results) ? data.results : [])
    .filter((x: any) => Number.isInteger(x?.id) && x.id > 0 && x.adult !== true)
    .map((x: any) => normalized(x, kind))
}
export async function trending(kind: Kind, period: 'day' | 'week' = 'week'): Promise<Movie[]> {
  const result = await query<any>('/trending/' + kind + '/' + period, { language: 'en-US' })
  return entries(result, kind)
}
export async function discover(kind: Kind, options: {
  genre?: number; free?: boolean; page?: number; region?: string; sort?: string; upcoming?: boolean
} = {}): Promise<Listing> {
  const page = Math.max(1, Math.min(500, Math.floor(options.page || 1)))
  const params: Record<string, number | string | undefined> = {
    page, sort_by: options.sort || 'popularity.desc', include_adult: 'false', language: 'en-US',
  }
  if (options.genre) params.with_genres = options.genre
  if (options.upcoming && kind === 'movie') {
    const start = new Date()
    const end = new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000)
    params['primary_release_date.gte'] = start.toISOString().slice(0,10)
    params['primary_release_date.lte'] = end.toISOString().slice(0,10)
    params.sort_by = 'primary_release_date.asc'
    params['vote_count.gte'] = 0
    params.with_release_type = '2|3'
  }
  if (options.free) {
    params.watch_region = /^[A-Z]{2}$/.test(options.region || 'US') ? options.region : 'US'
    params.with_watch_monetization_types = 'free|ads'
  }
  const result = await query<any>('/discover/' + kind, params, 45 * 60_000)
  return { items: entries(result, kind), pages: Math.min(Math.max(Number(result?.total_pages) || 1, 1), 500) }
}
export async function search(q: string): Promise<Movie[]> {
  const text = q.trim().slice(0, 100)
  if (text.length < 2) return []
  const result = await query<any>('/search/multi', { query: text, include_adult: 'false', language: 'en-US' }, 10 * 60_000)
  return (Array.isArray(result?.results) ? result.results : [])
    .filter((x: any) => (x.media_type === 'movie' || x.media_type === 'tv') && x.adult !== true && Number.isInteger(x.id))
    .map((x: any) => normalized(x, x.media_type as Kind))
}
async function enrichment(imdbId?: string, isTv = false): Promise<Pick<Movie, 'awards' | 'externalRatings' | 'tvStatus' | 'tvNetwork'>> {
  const result: Pick<Movie, 'awards' | 'externalRatings' | 'tvStatus' | 'tvNetwork'> = {}
  if (!imdbId || !/^tt\d+$/.test(imdbId)) return result
  const omdbKey = process.env.OMDB_API_KEY
  if (omdbKey) {
    const extra = await cached<any>('omdb:' + imdbId, 24 * 60 * 60_000, async () => {
      try {
        const response = await fetch('https://www.omdbapi.com/?i=' + imdbId + '&apikey=' + encodeURIComponent(omdbKey), { signal: AbortSignal.timeout(7000) })
        return response.ok ? await response.json() : null
      } catch { return null }
    })
    if (extra?.Response === 'True') {
      result.externalRatings = Array.isArray(extra.Ratings)
        ? extra.Ratings.filter((x: any) => typeof x.Source === 'string' && typeof x.Value === 'string').map((x: any) => ({ source: x.Source, value: x.Value }))
        : []
      if (extra.Awards && extra.Awards !== 'N/A') result.awards = String(extra.Awards)
    }
  }
  if (isTv && process.env.ENABLE_TVMAZE === 'true') {
    const show = await cached<any>('tvmaze:' + imdbId, 24 * 60 * 60_000, async () => {
      try {
        const response = await fetch('https://api.tvmaze.com/lookup/shows?imdb=' + imdbId, { signal: AbortSignal.timeout(7000) })
        return response.ok ? await response.json() : null
      } catch { return null }
    })
    if (show?.name) {
      result.tvStatus = show.status || undefined
      result.tvNetwork = show.network?.name || show.webChannel?.name || undefined
    }
  }
  return result
}
export async function details(kind: Kind, id: number): Promise<Movie | null> {
  if (!Number.isSafeInteger(id) || id < 1) return null
  const data = await query<any>('/' + kind + '/' + id, { append_to_response: 'credits,videos,recommendations,external_ids', language: 'en-US' }, 12 * 60 * 60_000)
  if (!data?.id || data.adult === true) return null
  const movie = normalized(data, kind)
  const cast: any[] = data.credits?.cast || []
  const crew: any[] = data.credits?.crew || []
  movie.cast = cast.filter(c => Number.isInteger(c.id)).slice(0, 24)
  movie.directors = crew.filter(c => c.job === 'Director' || (kind === 'tv' && c.job === 'Executive Producer')).slice(0, 7)
  movie.writers = crew.filter(c => ['Screenplay', 'Writer', 'Story'].includes(c.job)).slice(0, 7)
  movie.trailers = (data.videos?.results || []).filter((v: any) =>
    v.site === 'YouTube' && v.type === 'Trailer' && /^[\w-]{11}$/.test(v.key)
  ).slice(0, 3).map((v: any) => ({ key: v.key, name: v.name }))
  movie.similar = entries(data.recommendations, kind).slice(0, 12)
  movie.imdbId = data.external_ids?.imdb_id || data.imdb_id || undefined
  Object.assign(movie, await enrichment(movie.imdbId, kind === 'tv'))
  return movie
}
export async function providers(kind: Kind, id: number, region = 'US'): Promise<Providers | null> {
  if (!Number.isSafeInteger(id) || id < 1) return null
  const result = await query<{ results: Record<string, Providers> }>('/' + kind + '/' + id + '/watch/providers', {}, 3 * 60 * 60_000)
  return result?.results?.[/^[A-Z]{2}$/.test(region) ? region : 'US'] || null
}
export async function genres(kind: Kind): Promise<{ id: number; name: string }[]> {
  const result = await query<{ genres: { id: number; name: string }[] }>('/genre/' + kind + '/list', { language: 'en-US' }, 7 * 24 * 60 * 60_000)
  return result?.genres || []
}
export async function person(id: number): Promise<any | null> {
  if (!Number.isSafeInteger(id) || id < 1) return null
  return query<any>('/person/' + id, { append_to_response: 'combined_credits', language: 'en-US' }, 12 * 60 * 60_000)
}
