import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowUpRight, Search, ChevronRight, Clapperboard, Tv, Star, CalendarDays } from 'lucide-react'
import { getHome } from '../lib/server'
import { Section } from '../components/Cards'
import FeatureSlider from '../components/FeatureSlider'
import { canonical } from '../lib/seo'
export const Route = createFileRoute('/')({
  loader: () => getHome(),
  head: () => ({
    meta: [
      { title: 'Prime IMDb — Discover Movies, TV Shows, Ratings & Free Viewing Options' },
      { name:'description', content:'Discover trending movies, popular TV shows, cast, reviews, trailers, genres, and official free or ad-supported viewing options.' },
      { property:'og:title', content:'Prime IMDb — Your next movie starts here' },
    ],
    links: canonical('/'),
  }),
  component: Home,
})
function Home() {
  const {movies, trendingToday, popularMovies, tv, free, upcoming, movieGenres, configured} = Route.useLoaderData()
  const spotlight = (trendingToday.length ? trendingToday : movies).filter(movie => movie.backdrop)
  return <>
    <FeatureSlider items={spotlight}/>
    <div className="page-container home-content">
      <div className="quick-nav">
        <div className="quick-label"><span className="eyebrow">EXPLORE</span><strong>What are you in the mood for?</strong></div>
        <div className="genre-pills">
          {movieGenres.slice(0,13).map(genre => <Link key={genre.id} to="/genre/$id" params={{id:String(genre.id)}}>{genre.name}</Link>)}
          <Link to="/genres">All genres <ChevronRight size={14}/></Link>
        </div>
      </div>
      <Section eyebrow="WHAT EVERYONE'S WATCHING" title="Trending Today" href="/movies" ranked items={trendingToday}/>
      <Section eyebrow="DON'T MISS OUT" title="Trending This Week" href="/movies" items={movies}/>
      <section className="free-banner">
        <div className="free-banner-copy"><span className="eyebrow"><Star size={13} fill="currentColor"/> YOUR FREE MOVIE GUIDE</span><h2>Great movies.<br/><em>No subscription.</em></h2><p>Find movies available from legitimate free and ad-supported providers. Choose your country, discover a film, and check its official viewing options.</p><Link to="/free-movies" search={{page:1,region:'US'}} className="btn primary">Explore free movies <ArrowUpRight size={18}/></Link></div>
        <div className="free-banner-posters">{free.slice(0,4).filter(m=>m.poster).map((m,i)=><Link to="/$kind/$id" params={{kind:m.kind,id:String(m.id)}} search={{region:'US'}} key={m.id} className={'free-poster free-poster-'+i}><img src={m.poster||''} alt={m.title+' poster'} loading="lazy"/></Link>)}</div>
      </section>
      <Section eyebrow="FRESH PICKS" title="Popular Movies" href="/movies" items={popularMovies}/>
      <Section eyebrow="THE SERIES EVERYONE TALKS ABOUT" title="Popular TV Shows" href="/tv" items={tv}/>
      <Section eyebrow="EXPLORE LEGITIMATE FREE & AD-SUPPORTED TITLES" title="Free to Watch" href="/free-movies" items={free}/>
      <Section eyebrow="COMING TO THE BIG SCREEN" title="Upcoming Movies" href="/movies" items={upcoming}/>
      <div className="home-discovery">
        <div><span className="eyebrow"><Clapperboard size={15}/> MOVIE EXPLORER</span><h2>Find something<br/>worth watching.</h2><p>Search by title or browse actors, genres and highly rated films.</p></div>
        <form className="large-search" action="/search" method="get"><Search size={22}/><input type="search" name="q" minLength={2} required placeholder="Search movies and TV shows..." aria-label="Search movie catalog"/><button type="submit">Search <ArrowUpRight size={17}/></button></form>
      </div>
      {!configured && <div className="setup-notice"><b>API SETUP NEEDED</b> — Add <code>TMDB_API_READ_TOKEN</code> to your hosting environment. Movie data, images, cast and discovery will populate automatically.</div>}
    </div>
  </>
}
