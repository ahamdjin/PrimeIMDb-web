/** Optional, server-side Watchmode integration with bounded in-memory caching.
 * Watchmode may charge 2 credits per title lookup by TMDB ID; keep it off
 * until you intentionally configure WATCHMODE_API_KEY. */
export type WatchmodeSource = {
  name: string; type: string; region: string;
  web_url?: string; source_id?: number; format?: string; price?: number | null
}
const cache = new Map<string, { expires: number; value: WatchmodeSource[] }>()
const inflight = new Map<string, Promise<WatchmodeSource[]>>()
async function fetchWatchmode(kind: 'movie' | 'tv', tmdbId: number, region: string, apiKey: string): Promise<WatchmodeSource[]> {
  try {
    const url = new URL('https://api.watchmode.com/v1/title/' + kind + '-' + tmdbId + '/sources/')
    url.searchParams.set('regions', region)
    const response = await fetch(url, {
      headers: { 'X-API-Key': apiKey, Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) return []
    const data = await response.json() as unknown
    if (!Array.isArray(data)) return []
    return data.filter((entry: any) => entry && typeof entry.name === 'string' && entry.region === region)
      .slice(0, 25).map((entry: any) => ({
        name: String(entry.name), type: String(entry.type || 'unknown'),
        region: String(entry.region), source_id: Number(entry.source_id || 0),
        web_url: typeof entry.web_url === 'string' && /^https:\/\//.test(entry.web_url) ? entry.web_url : undefined,
        format: entry.format, price: typeof entry.price === 'number' ? entry.price : null,
      }))
  } catch { return [] }
}
export async function watchmodeSources(kind: 'movie' | 'tv', tmdbId: number, region = 'US'): Promise<WatchmodeSource[]> {
  const key = process.env.WATCHMODE_API_KEY
  if (!key || !Number.isSafeInteger(tmdbId) || tmdbId <= 0 || !/^[A-Z]{2}$/.test(region)) return []
  const cacheKey = kind + ':' + tmdbId + ':' + region
  const hit = cache.get(cacheKey)
  if (hit && hit.expires > Date.now()) return hit.value
  if (inflight.has(cacheKey)) return inflight.get(cacheKey)!
  const request = fetchWatchmode(kind, tmdbId, region, key).then(value => {
    if (cache.size > 400) cache.clear()
    // Cache empty results briefly so transient errors can recover.
    cache.set(cacheKey, { expires: Date.now() + (value.length ? 3 * 3600_000 : 5 * 60_000), value })
    return value
  }).finally(() => inflight.delete(cacheKey))
  inflight.set(cacheKey, request)
  return request
}
