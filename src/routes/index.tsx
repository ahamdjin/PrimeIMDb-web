import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowUpRight, ArrowDown, Play, Star } from 'lucide-react'
import { getHome } from '../lib/server'
import { Section, Card } from '../components/Cards'
import { canonical } from '../lib/seo'
export const Route = createFileRoute('/')({
  loader: () => getHome(),
  head: () => ({
    meta: [
      { title: 'Discover Cinema, TV & Free Movies | Prime IMDb' },
      { name: 'description', content: 'An editorial guide to film and TV. Discover new stories, acclaimed classics, casts, ratings and legal free-to-watch availability.' },
      { property: 'og:title', content: 'Prime IMDb — A Journal of Film & Television' },
    ],
    links: canonical('/'),
  }),
  component: Home,
})
function Home() {
  const { movies, tv, free, configured } = Route.useLoaderData()
  const spotlight = movies.find(m => m.backdrop && m.overview) || movies[0]
  const secondary = movies.slice(1,4)
  return <>
    <section className="opening-hero">
      <div className="page-container hero-topline"><span><Star size={12} fill="currentColor"/> DISCOVER THE STORIES THAT STAY</span><span>AN EDITORIAL FILM DISCOVERY EXPERIENCE</span></div>
      <div className="page-container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">ISSUE 001 <span className="eyebrow-line"></span> THE MOVING IMAGE</p>
          <h1>Some stories<br/>deserve a<br/><em>closer look.</em></h1>
          <p className="hero-intro">For the films you love, the ones you missed, and the ones you haven't found yet. A more thoughtful guide to the screen.</p>
          <Link to="/movies" search={{page:1}} className="btn primary">Explore the films <ArrowUpRight size={19}/></Link>
          <div className="hero-bottom"><span>INDEPENDENT FILM DISCOVERY</span><ArrowDown size={18}/><span>SCROLL TO EXPLORE</span></div>
        </div>
        <div className="hero-art">
          {spotlight?.backdrop || spotlight?.poster ? <img src={spotlight.backdrop || spotlight.poster || ''} alt={spotlight.title + ' film artwork'} fetchPriority="high" /> : <div className="hero-art-placeholder"><span>THE ART<br/>OF CINEMA.</span></div>}
          <div className="hero-frame"/>
          <div className="hero-caption"><div><span>THIS WEEK'S SPOTLIGHT</span><strong>{spotlight?.title || 'Every film has a story.'}</strong></div>{spotlight && <Link to="/$kind/$id" search={{region:"US"}} params={{kind:spotlight.kind,id:String(spotlight.id)}} aria-label={'Explore ' + spotlight.title}><ArrowUpRight size={20}/></Link>}</div>
          <span className="hero-side-label">THE FILM JOURNAL / VOL. 01</span>
        </div>
      </div>
      <div className="marquee" aria-hidden="true"><div>DISCOVER ✳ WATCH ✳ THINK ✳ FEEL ✳ REMEMBER ✳ DISCOVER ✳ WATCH ✳ THINK ✳ FEEL ✳ REMEMBER ✳ </div></div>
    </section>
    <div className="page-container body-sections">
      <section className="intro-editorial">
        <div><span className="eyebrow">A NEW KIND OF FILM GUIDE</span><h2>Curiosity looks<br/><em>good on you.</em></h2></div>
        <div><p>There is more to cinema than a rating. Find the people behind the work, the stories that connect us, and verified places to watch when you're ready.</p><Link to="/genres" className="text-link">Follow your curiosity <ArrowUpRight size={18}/></Link></div>
      </section>
      <Section eyebrow="THE WEEKLY EDIT / 01" title="Films in the conversation." items={movies} href="/movies" ranked />
      <section className="featured-editorial">
        <div className="featured-copy"><span className="eyebrow">THE OPEN-SCREEN EDIT</span><h2>Great cinema.<br/><em>On your terms.</em></h2><p>Discover films listed by movie-data providers as free or ad-supported. No misleading links, no guessing: always confirm the offer with the official platform.</p><Link to="/free-movies" search={{page:1,region:"US"}} className="btn inverse">Find free films <ArrowUpRight size={18}/></Link><span className="microcopy">AVAILABILITY VARIES BY REGION AND DATE.</span></div>
        <div className="featured-posters">{(free.length ? free : secondary).slice(0,3).map((m,i)=><Link to="/$kind/$id" search={{region:"US"}} params={{kind:m.kind,id:String(m.id)}} key={m.kind+m.id} className={'stacked-poster stacked-'+i}><img src={m.poster||m.backdrop||''} alt={m.title+' poster'} loading="lazy"/></Link>)}{!free.length&&!secondary.length&&<span className="featured-fallback">A WORLD OF STORIES<br/>IS WAITING.</span>}</div>
      </section>
      <Section eyebrow="THE WEEKLY EDIT / 02" title="Series worth staying in for." items={tv} href="/tv"/>
      <div className="journal-divider"><span>✳</span><span>THE END OF THIS PAGE IS JUST THE BEGINNING.</span><span>✳</span></div>
      <section className="journal-close"><span className="eyebrow">FIND YOUR NEXT FAVORITE</span><h2>What are you in<br/><em>the mood for?</em></h2><form action="/search" method="get" className="large-search"><input name="q" required minLength={2} placeholder="A title, a feeling, a name..." aria-label="Search movie titles"/><button type="submit"><ArrowUpRight size={26}/></button></form><div className="suggestions"><span>OR EXPLORE</span><Link to="/genres">BY GENRE ↗</Link><Link to="/tv" search={{page:1}}>TELEVISION ↗</Link><Link to="/free-movies" search={{page:1,region:"US"}}>FREE TO WATCH ↗</Link></div></section>
      {!configured && <aside className="setup-notice">LIVE CATALOG NOT CONNECTED: add <code>TMDB_API_READ_TOKEN</code> in your hosting environment to populate every section.</aside>}
    </div>
  </>
}
