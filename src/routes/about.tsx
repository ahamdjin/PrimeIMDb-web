import { createFileRoute } from '@tanstack/react-router'
import { canonical } from '../lib/seo'
export const Route = createFileRoute('/about')({
  head: () => ({ meta: [
    { title: 'About Prime IMDb Web — Editorial Film Discovery & Data Sources' },
    { name: 'description', content: 'Learn how our independent movie discovery site uses movie metadata, legal provider availability and clear source attribution.' },
  ], links: canonical('/about') }),
  component: About,
})
function About() {
  return <div className="page-container inner-page credits-layout">
    <header className="page-lead"><span className="eyebrow">ABOUT THE FILM JOURNAL</span><h1>A home for <em>curiosity.</em></h1><p>An independent movie and television discovery journal, designed for people who enjoy looking beyond the thumbnail.</p></header>
    <h2>Our approach</h2><p>We combine screen metadata with an editorial presentation, transparent scores, cast profiles, series guides, and official viewing availability. Where a provider does not supply a fact, we leave the field unfilled rather than invent an answer.</p>
    <h2>Movie-data attribution</h2>
    <p>This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB. Posters, stills, film information and ratings may be sourced from TMDB. Use of TMDB data and images is subject to TMDB's license and attribution requirements.</p>
    <p><a href="https://www.themoviedb.org/about/logos-attribution" target="_blank" rel="noopener noreferrer">View TMDB's officially approved logos and attribution guidelines ↗</a></p>
    <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer"><img src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Tmdb.new.logo.svg" alt="The Movie Database (TMDB)" width={180} loading="lazy"/></a>
    <h2>Where to watch</h2><p>Streaming availability is provided via TMDB's partnership with <a href="https://www.justwatch.com/" target="_blank" rel="noopener noreferrer">JustWatch</a>. Availability can differ by region and date. Provider listings do not constitute endorsements, guarantee availability, or grant us distribution rights.</p>
    <h2>Additional data partners</h2><p>If enabled and licensed, OMDb can supplement award and rating data, and TVmaze can provide TV show status and network information. TMDB remains the source of canonical title IDs and core metadata.</p>
    <h2>Independence</h2><p>This discovery website does not host or distribute movies. We link to external viewing guides and officially listed providers. All film, television and streaming brands remain the property of their respective owners.</p>
  </div>
}
