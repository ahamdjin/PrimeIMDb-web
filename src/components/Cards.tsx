import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import type { Movie } from '../lib/tmdb'

export function Card({ item, number }: { item: Movie; number?: number }) {
  return <Link to="/$kind/$id" search={{region:"US"}} params={{ kind: item.kind, id: String(item.id) }} className="film-card">
    <div className="film-card-image">
      {item.poster ? <img src={item.poster} alt={item.title + ' theatrical poster'} loading="lazy" decoding="async"/> : <div className="poster-placeholder"><span>✳</span><small>ARTWORK UNAVAILABLE</small></div>}
      {number && <span className="rank-number">{String(number).padStart(2,'0')}</span>}
      <span className="card-arrow"><ArrowUpRight size={19}/></span>
    </div>
    <div className="film-card-topline"><span>{item.kind === 'movie' ? 'FILM' : 'SERIES'} / {item.year || 'TBA'}</span>{item.votes > 0 && <span>★ {item.rating.toFixed(1)}</span>}</div>
    <h3>{item.title}</h3>
  </Link>
}
export function Grid({ items, ranked = false }: { items: Movie[]; ranked?: boolean }) {
  return items.length ? <div className="film-grid">{items.map((item,i) => <Card key={item.kind + item.id} item={item} number={ranked ? i + 1 : undefined}/>)}</div> : <EmptyState/>
}
export function EmptyState({ message = 'The collection is not available yet. Connect a movie-data API to fill these pages automatically.' }: { message?: string }) {
  return <div className="empty-state"><span>✳</span><h3>More stories are coming.</h3><p>{message}</p></div>
}
export function Section({ title, eyebrow, items, href, ranked = false }: { title: string; eyebrow: string; items: Movie[]; href: string; ranked?: boolean }) {
  return <section className="editorial-section">
    <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div><a href={href} className="text-link">Explore collection <ArrowUpRight size={18}/></a></div>
    <Grid items={items.slice(0,6)} ranked={ranked}/>
  </section>
}
