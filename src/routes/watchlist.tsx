import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Bookmark, Trash2 } from 'lucide-react'
import { getSaved, saveToggle, WATCHLIST_EVENT, type SavedTitle } from '../lib/watchlist'
import { Card } from '../components/Cards'
export const Route = createFileRoute('/watchlist')({
  head: () => ({meta:[{title:'My Watchlist | Prime IMDb'},{name:'robots',content:'noindex,nofollow'}]}),
  component: Watchlist,
})
function Watchlist() {
  const [items,setItems] = useState<SavedTitle[]>([])
  const [ready,setReady] = useState(false)
  useEffect(() => {
    const sync = () => {setItems(getSaved());setReady(true)}
    sync()
    window.addEventListener('storage',sync)
    window.addEventListener(WATCHLIST_EVENT,sync)
    return () => {window.removeEventListener('storage',sync);window.removeEventListener(WATCHLIST_EVENT,sync)}
  },[])
  return <div className="page-container inner-page">
    <header className="page-lead"><span className="eyebrow"><Bookmark size={15}/> YOUR PERSONAL WATCHLIST</span><h1>My Watchlist</h1><p>Save movies and TV shows for later. Your list is stored only in this browser; no login or database is required.</p></header>
    {items.length ? <div className="saved-grid">{items.map(item => <div key={item.kind+'-'+item.id} className="saved-card"><Card item={{...item,overview:'',backdrop:null,votes:0,genres:[]}}/><button type="button" onClick={() => saveToggle(item)}><Trash2 size={15}/> Remove</button></div>)}</div> :
      <div className="empty-state"><Bookmark size={30}/><h3>{ready?'Your watchlist is empty':'Loading your watchlist…'}</h3><p>Find a movie you like and select “Add to Watchlist” to save it here.</p><Link to="/movies" search={{page:1}} className="btn primary">Find movies</Link></div>}
  </div>
}
