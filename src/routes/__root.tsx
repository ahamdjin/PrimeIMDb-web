import { createRootRoute, HeadContent, Outlet, Scripts, Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Search, ArrowUpRight } from 'lucide-react'
import '../styles.css'
import { canonical, schema } from '../lib/seo'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Prime IMDb — A Journal of Film & Television' },
      { name: 'description', content: 'Explore cinema with a beautiful film database, cast guides, TV series and legally available free viewing options.' },
      { property: 'og:type', content: 'website' },
      { name: 'theme-color', content: '#f4f0e9' },
    ],
    links: [{ rel: 'icon', href: '/favicon.svg' }],
    scripts: schema({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Prime IMDb', description: 'Film, television and official streaming availability' }),
  }),
  component: Layout,
  shellComponent: Shell,
  notFoundComponent: () => <div className="page-container missing-page"><span className="eyebrow">THE END OF THE REEL</span><h1>That page is missing.</h1><p>Let's return to something worth watching.</p><Link to="/" className="btn primary">Back to the journal <ArrowUpRight size={16}/></Link></div>,
})
function Shell({ children }: { children: ReactNode }) {
  return <html lang="en"><head><HeadContent /></head><body>{children}<Scripts /></body></html>
}
function Layout() {
  return <>
    <div className="announcement"><span>THE FILM JOURNAL</span><span>AN INDEPENDENT GUIDE TO WHAT'S WORTH WATCHING</span><span>ISSUE N° 01 <i>✦</i> OPEN ACCESS</span></div>
    <header className="site-header">
      <div className="page-container header-inner">
        <Link to="/" className="wordmark" aria-label="Prime IMDb home"><span className="wordmark-symbol">P<span>✳</span></span><span className="wordmark-name">PRIME <b>IMDb</b><small>THE SCREEN JOURNAL</small></span></Link>
        <nav aria-label="Primary navigation" className="main-navigation">
          <Link to="/movies" activeProps={{className:'active'}}>Films</Link>
          <Link to="/tv" activeProps={{className:'active'}}>Television</Link>
          <Link to="/free-movies" activeProps={{className:'active'}}>Watch for free</Link>
          <Link to="/genres" activeProps={{className:'active'}}>Explore</Link>
        </nav>
        <form className="header-search" action="/search" method="get">
          <Search size={17} aria-hidden="true"/>
          <input name="q" aria-label="Search titles" placeholder="Search titles, actors..." minLength={2} required/>
          <button type="submit" aria-label="Submit search"><ArrowUpRight size={18}/></button>
        </form>
      </div>
    </header>
    <main><Outlet /></main>
    <footer className="site-footer">
      <div className="page-container">
        <div className="footer-main">
          <div><p className="footer-kicker">A BETTER WAY TO FIND WHAT'S NEXT.</p><strong className="footer-title">Good stories<br/><em>stay with us.</em></strong></div>
          <div className="footer-links"><span>DISCOVER</span><Link to="/movies">All films</Link><Link to="/tv">TV & series</Link><Link to="/free-movies">Free viewing guide</Link><Link to="/genres">Explore genres</Link></div>
          <div className="footer-links"><span>ABOUT</span><Link to="/about">About & sources</Link><a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">The Movie Database <ArrowUpRight size={13}/></a><a href="https://www.justwatch.com/" target="_blank" rel="noopener noreferrer">JustWatch <ArrowUpRight size={13}/></a></div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} PRIME IMDb WEB — AN INDEPENDENT EDITORIAL PROJECT</span><span>FILM IS BETTER WHEN SHARED. <b>✳</b></span></div>
      </div>
    </footer>
  </>
}
