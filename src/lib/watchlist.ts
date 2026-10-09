import type { Kind, Movie } from './tmdb'
export type SavedTitle = Pick<Movie,'id'|'kind'|'title'|'poster'|'year'|'rating'>
export const WATCHLIST_KEY = 'primeimdb:saved-titles:v1'
export const WATCHLIST_EVENT = 'primeimdb:watchlist-updated'
export function getSaved(): SavedTitle[] {
  if (typeof window === 'undefined') return []
  try {
    const value = JSON.parse(window.localStorage.getItem(WATCHLIST_KEY) || '[]') as SavedTitle[]
    return Array.isArray(value) ? value.filter(x =>
      Number.isSafeInteger(x?.id) && x.id > 0 &&
      (x?.kind === 'movie' || x?.kind === 'tv') &&
      typeof x.title === 'string'
    ).slice(0,300) : []
  } catch { return [] }
}
export function saveToggle(movie: SavedTitle) {
  if (typeof window === 'undefined') return []
  const existing = getSaved()
  const found = existing.some(x => x.id === movie.id && x.kind === movie.kind)
  const next = found ? existing.filter(x => x.id !== movie.id || x.kind !== movie.kind) : [movie,...existing].slice(0,300)
  try {
    window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next))
    window.dispatchEvent(new Event(WATCHLIST_EVENT))
  } catch {}
  return next
}
