import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Star } from 'lucide-react'
import type { Movie } from '../lib/tmdb'

export function Card({ item, number }: { item: Movie; number?: number }) {
  return <Link to="/$kind/$id" params={{ kind: item.kind, id: String(item.id) }} search={{region:'US'}} className="film-card" aria-label={'Explore ' + item.title}>
    <div className="film-card-image">
      {item.poster ? <img src={item.poster} alt={item.title + ' movie poster'} loading="lazy" decoding="async" /> :
        <div className="poster-placeholder"><span>✦</span><small>NO POSTER</small></div>}
      {number && <span className="rank-number">#{number}</span>}
      {item.votes > 0 && <span className="rating-pill"><Star size={12} fill="currentColor"/> {item.rating.toFixed(1)}</span>}
      <span className="card-arrow"><ArrowUpRight size={19}/></span>
    </div>
    <h3>{item.title}</h3>
    <div className="film-card-topline"><span>{item.year || 'TBA'}</span><span>{item.kind === 'movie' ? 'Movie' : 'TV series'}</span></div>
  </Link>
}
export function Grid({ items, ranked = false }: { items: Movie[]; ranked?: boolean }) {
  return items.length ? <div className="film-grid">{items.map((item,i) => <Card key={item.kind + item.id} item={item} number={ranked ? i + 1 : undefined} />)}</div> : <EmptyState/>
}
export function EmptyState({ message = 'No titles loaded yet. Connect your TMDB API key to populate this catalog.' }: { message?: string }) {
  return <div className="empty-state"><span>✦</span><h3>Coming soon</h3><p>{message}</p></div>
}
export function Section({ title, eyebrow, items, href, ranked = false }: { title: string; eyebrow: string; items: Movie[]; href: string; ranked?: boolean }) {
  return <section className="editorial-section">
    <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div><a href={href} className="text-link">See all <ArrowUpRight size={16}/></a></div>
    <div className="film-rail">{items.length ? items.slice(0,16).map((item,i) => <div key={item.kind + item.id} className="rail-item"><Card item={item} number={ranked ? i + 1 : undefined}/></div>) : <EmptyState/>}</div>
  </section>
}
