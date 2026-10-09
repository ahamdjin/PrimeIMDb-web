import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ArrowUpRight, Play, CalendarDays, Clock3, Star } from 'lucide-react'
import { getDetails } from '../lib/server'
import { image } from '../lib/tmdb'
import { Grid } from '../components/Cards'
import WatchlistButton from '../components/WatchlistButton'
import { canonical, schema, movieSchema, movieMeta } from '../lib/seo'

const countries = [{code:'US',name:'United States'},{code:'GB',name:'United Kingdom'},{code:'CA',name:'Canada'},{code:'AU',name:'Australia'},{code:'IN',name:'India'},{code:'PK',name:'Pakistan'},{code:'DE',name:'Germany'},{code:'FR',name:'France'}]
export const Route = createFileRoute('/$kind/$id')({
  validateSearch: (s: Record<string, unknown>) => ({
    region: typeof s.region === 'string' && countries.some(c => c.code === (s.region as string).toUpperCase()) ? (s.region as string).toUpperCase() : 'US',
  }),
  loaderDeps: ({search}) => search,
  loader: async ({ params, deps }) => {
    if (!['movie','tv'].includes(params.kind) || !/^\d+$/.test(params.id)) throw notFound()
    const result = await getDetails({ data: { kind: params.kind as 'movie' | 'tv', id: Number(params.id), region: deps.region } })
    if (!result.item) throw notFound()
    return result
  },
  head: ({ loaderData, params }) => {
    const movie = loaderData?.item
    return movie ? {
      meta: movieMeta(movie),
      links: canonical('/' + params.kind + '/' + params.id),
      scripts: schema(movieSchema(movie)),
    } : { meta: [{ title: 'Film details | Prime IMDb' }, { name: 'robots', content: 'noindex' }] }
  },
  component: Page,
})
function Page() {
  const { item: m, where } = Route.useLoaderData()
  const { region } = Route.useSearch()
  const label = countries.find(c => c.code === region)?.name || 'United States'
  const free = [...(where?.free || []), ...(where?.ads || [])].filter((p,i,a) => a.findIndex(v => v.provider_id === p.provider_id) === i)
  const subscription = where?.flatrate || []
  const allProviders = free.length + subscription.length + (where?.rent?.length || 0) + (where?.buy?.length || 0)
  if (!m) return null
  return <>
    <section className="detail-hero">
      <div className="detail-hero-bg" style={m.backdrop ? { backgroundImage: 'url("' + m.backdrop + '")' } : undefined}/>
      <div className="detail-hero-overlay"/>
      <div className="page-container detail-wrap">
        {m.poster ? <img src={m.poster} className="detail-poster" alt={m.title + ' theatrical poster'}/> : <div className="detail-poster poster-placeholder">✳</div>}
        <div>
          <span className="eyebrow">{m.kind === 'tv' ? 'TELEVISION / SERIES' : 'CINEMA / FEATURE FILM'} — THE TITLE ARCHIVE</span>
          <h1>{m.title}</h1>
          {m.tagline && <p className="detail-tagline">{m.tagline}</p>}
          <div className="detail-meta">
            {m.year && <span><CalendarDays size={14}/> {m.year}</span>}
            {m.runtime && <span><Clock3 size={14}/> {m.runtime} MIN</span>}
            {m.votes > 0 && <b><Star size={14} fill="currentColor"/> {m.rating.toFixed(1)} / 10 TMDB</b>}
          </div>
          <p className="detail-overview">{m.overview || 'An editorial synopsis is not currently available from our metadata provider.'}</p>
          <div className="detail-chips">{m.genres.map(g => <Link key={g.id} to="/genre/$id" params={{ id: String(g.id) }}>{g.name}</Link>)}</div>
          <div className="detail-actions">
            {m.trailers?.[0] && <a href={'https://www.youtube.com/watch?v=' + encodeURIComponent(m.trailers[0].key)} target="_blank" rel="noopener noreferrer" className="btn inverse"><Play size={17} fill="currentColor"/> Watch trailer</a>}
            <a className="btn outline" href="#availability">Official viewing options <ArrowUpRight size={18}/></a>
            <WatchlistButton movie={{id:m.id,kind:m.kind,title:m.title,poster:m.poster,year:m.year,rating:m.rating}}/>
          </div>
        </div>
      </div>
    </section>
    <div className="page-container detail-body">
      <div className="detail-columns">
        <div>
          <div className="detail-heading"><div><span className="eyebrow">BEHIND THE STORY</span><h2>The people who made it.</h2></div></div>
          {m.cast?.length ? <div className="cast-grid">{m.cast.slice(0,12).map(person => <Link key={person.id} to="/person/$id" params={{id:String(person.id)}} className="person-card">
            {person.profile_path ? <img src={image(person.profile_path,'w185') || ''} alt={person.name} loading="lazy"/> : <div className="avatar-missing">✳</div>}
            <strong>{person.name}</strong><small>{person.character}</small>
          </Link>)}</div> : <p className="source-note">Cast data is not yet available for this title.</p>}
          <div className="fact-box">
            {m.directors?.length ? <div><small>{m.kind==='tv'?'SHOW CREATORS / PRODUCERS':'DIRECTED BY'}</small><p>{m.directors.map(x=>x.name).join(', ')}</p></div> : null}
            {m.writers?.length ? <div><small>WRITTEN BY</small><p>{m.writers.map(x=>x.name).join(', ')}</p></div> : null}
            {m.originalLanguage && <div><small>ORIGINAL LANGUAGE</small><p>{m.originalLanguage.toUpperCase()}</p></div>}
            {m.status && <div><small>STATUS</small><p>{m.status}</p></div>}
            {m.tvStatus && <div><small>TVMAZE STATUS</small><p>{m.tvStatus}{m.tvNetwork ? ' · ' + m.tvNetwork : ''}</p></div>}
            {m.awards && <div><small>AWARDS INFORMATION / OMDB</small><p>{m.awards}</p></div>}
          </div>
          {!!m.externalRatings?.length && <section className="editorial-section"><span className="eyebrow">CROSS-SOURCE PERSPECTIVE</span><h2>More rating sources.</h2><div className="additional-ratings">{m.externalRatings.map((r,i)=><div key={i}><span>{r.source}</span><strong>{r.value}</strong></div>)}</div><p className="source-note">Supplemental scores are provided by OMDb when connected and licensed; methodologies may differ.</p></section>}
          {!!m.seasons?.length && <section className="editorial-section"><div className="section-heading"><div><span className="eyebrow">EPISODES & SEASONS</span><h2>The series guide.</h2></div></div><div className="genre-grid">{m.seasons.filter(s=>s.season_number>0).map(s=><div key={s.id}>{s.name}<span>{s.episode_count} EPISODES</span></div>)}</div></section>}
        </div>
        <aside className="where-panel" id="availability">
          <span className="eyebrow">THE VIEWING GUIDE</span>
          <h2>Where to watch.</h2>
          <p>Legal availability listings from TMDB / JustWatch. Choose a region and check the provider before paying or signing up.</p>
          <form className="controls-row" action={'/' + m.kind + '/' + m.id} method="get">
            <label htmlFor="watch-country">COUNTRY <select id="watch-country" name="region" defaultValue={region}>{countries.map(c=><option key={c.code} value={c.code}>{c.name}</option>)}</select></label>
            <button type="submit">↗</button>
          </form>
          {!!free.length && <><h3>Listed as free or ad-supported</h3>{free.map(p=><div className="provider" key={p.provider_id}>
            {p.logo_path && <img src={image(p.logo_path,'w92') || ''} alt="" loading="lazy"/>}<span>{p.provider_name}</span><b>FREE / ADS*</b>
          </div>)}</>}
          {!!subscription.length && <><h3>Subscription</h3>{subscription.map(p=><div className="provider" key={p.provider_id}>{p.logo_path && <img src={image(p.logo_path,'w92') || ''} alt="" loading="lazy"/>}{p.provider_name}</div>)}</>}
          {!!where?.rent?.length && <><h3>Rent</h3>{where.rent.map(p=><div className="provider" key={p.provider_id}>{p.provider_name}</div>)}</>}
          {!allProviders && <p>No verified provider listing is currently available for {label}.</p>}
          {where?.link && <a className="btn primary" href={where.link} target="_blank" rel="noopener nofollow noreferrer">Check viewing links <ArrowUpRight size={16}/></a>}
          <small>*A listing as free or ad-supported does not guarantee that it is currently accessible without registration, advertisements, geographical limitations or other conditions. JustWatch is the source of viewing availability via TMDB. The link above opens the TMDB viewing guide, not a video player.</small>
        </aside>
      </div>
      {!!m.similar?.length && <section className="editorial-section"><div className="section-heading"><div><span className="eyebrow">CONTINUE EXPLORING</span><h2>If you liked this, keep looking.</h2></div></div><Grid items={m.similar.slice(0,6)}/></section>}
    </div>
  </>
}
