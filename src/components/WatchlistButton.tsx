'use client'
import { useEffect, useState } from 'react'
import { BookmarkCheck, BookmarkPlus } from 'lucide-react'
import { getSaved, saveToggle, WATCHLIST_EVENT } from '../lib/watchlist'
import type { SavedTitle } from '../lib/watchlist'
export default function WatchlistButton({ movie }: { movie: SavedTitle }) {
  const [saved,setSaved] = useState(false)
  useEffect(() => {
    const sync = () => setSaved(getSaved().some(x => x.kind === movie.kind && x.id === movie.id))
    sync()
    window.addEventListener('storage',sync)
    window.addEventListener(WATCHLIST_EVENT,sync)
    return () => {window.removeEventListener('storage',sync);window.removeEventListener(WATCHLIST_EVENT,sync)}
  }, [movie.kind,movie.id])
  return <button type="button" className="btn outline save-button" aria-pressed={saved}
    onClick={() => setSaved(saveToggle(movie).some(x => x.kind === movie.kind && x.id === movie.id))}>
    {saved ? <BookmarkCheck size={18}/> : <BookmarkPlus size={18}/>}
    {saved ? 'In My Watchlist' : 'Add to Watchlist'}
  </button>
}
