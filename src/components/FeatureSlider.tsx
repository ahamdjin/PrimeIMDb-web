'use client'
import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowUpRight, ChevronLeft, ChevronRight, Star, Play } from 'lucide-react'
import type { Movie } from '../lib/tmdb'
export default function FeatureSlider({ items }: { items: Movie[] }) {
  const slides = items.filter(x => x.backdrop && x.overview).slice(0, 5)
  const [active, setActive] = useState(0)
  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => setActive(p => (p + 1) % slides.length), 8000)
    return () => clearInterval(timer)
  }, [slides.length])
  if (!slides.length) return <section className="showcase showcase-empty"><div className="page-container showcase-copy">
    <span className="showcase-label">THE WORLD OF MOVIES, ALL IN ONE PLACE</span>
    <h1>Discover your<br/><em>next obsession.</em></h1>
    <p>Explore movies, television, ratings, cast, trailers and where to watch — including free and ad-supported options.</p>
    <Link to="/movies" search={{page:1}} className="btn primary">Browse the catalog <ArrowUpRight size={17}/></Link>
  </div></section>
  const item = slides[active]
  return <section className="showcase" aria-label="Trending movie highlights">
    <div className="showcase-image" key={item.kind + item.id} style={{ backgroundImage: 'url("' + item.backdrop + '")' }}/>
    <div className="showcase-gradient"/>
    <div className="page-container showcase-inner">
      <div className="showcase-copy">
        <div className="showcase-badges"><span className="hot-label">✦ TRENDING NOW</span><span>THE WEEKLY SPOTLIGHT</span></div>
        <h1>{item.title}</h1>
        <div className="showcase-meta"><span className="tmdb-rating"><Star size={17} fill="currentColor"/> {item.votes ? item.rating.toFixed(1) : '—'} <small>/ 10</small></span><span>{item.year || 'Coming soon'}</span><span>{item.kind === 'tv' ? 'TV Series' : 'Movie'}</span></div>
        <p>{item.overview}</p>
        <div className="showcase-actions">
          <Link to="/$kind/$id" params={{ kind:item.kind, id:String(item.id) }} search={{region:'US'}} className="btn primary"><Play size={17} fill="currentColor"/> Explore title</Link>
          <Link to="/free-movies" search={{page:1,region:'US'}} className="btn ghost">Find free movies <ArrowUpRight size={17}/></Link>
        </div>
      </div>
      <div className="showcase-controls">{slides.length > 1 && <>
        <span>{String(active + 1).padStart(2,'0')} <i>/</i> {String(slides.length).padStart(2,'0')}</span>
        <button aria-label="Previous featured title" onClick={() => setActive((active - 1 + slides.length) % slides.length)}><ChevronLeft size={21}/></button>
        <button aria-label="Next featured title" onClick={() => setActive((active + 1) % slides.length)}><ChevronRight size={21}/></button>
      </>}</div>
    </div>
    {slides.length > 1 && <div className="showcase-dots">{slides.map((x,i) => <button key={x.id} aria-label={'View featured title ' + (i+1)} aria-current={active===i} onClick={() => setActive(i)} />)}</div>}
  </section>
}
