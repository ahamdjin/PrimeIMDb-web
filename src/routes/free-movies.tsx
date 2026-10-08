import { createFileRoute } from '@tanstack/react-router'
import { getBrowse } from '../lib/server'
import { Grid } from '../components/Cards'
import { canonical } from '../lib/seo'
const countries = [{code:'US',name:'United States'},{code:'GB',name:'United Kingdom'},{code:'CA',name:'Canada'},{code:'AU',name:'Australia'},{code:'IN',name:'India'},{code:'PK',name:'Pakistan'},{code:'DE',name:'Germany'},{code:'FR',name:'France'}]
export const Route = createFileRoute('/free-movies')({
  validateSearch: (s: Record<string, unknown>) => ({
    page: Math.max(1, Math.min(500, Number(s.page) || 1)),
    region: typeof s.region === 'string' && countries.some(c => c.code === (s.region as string).toUpperCase()) ? (s.region as string).toUpperCase() : 'US',
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => getBrowse({ data: { kind: 'movie', free: true, page: deps.page, region: deps.region } }),
  head: () => ({
    meta: [{ title: 'Free Movies to Watch Legally — Find Free & Ad-Supported Films | Prime IMDb' },
      { name: 'description', content: 'Discover movies listed as free to watch legally, including ad-supported streaming. Explore services and availability by country.' }],
    links: canonical('/free-movies'),
  }),
  component: Page,
})
function Page() {
  const data = Route.useLoaderData(), { region, page } = Route.useSearch()
  const country = countries.find(c => c.code === region)?.name || 'United States'
  return <div className="page-container inner-page">
    <header className="page-lead"><span className="eyebrow">THE OPEN-SCREEN COLLECTION / NO SUBSCRIPTION</span><h1>Free to watch. <em>Full of wonder.</em></h1><p>Find movies listed by our data partners as free or ad-supported in {country}. Availability can change: always verify the offer on the official service before watching.</p></header>
    <form className="controls-row" action="/free-movies" method="get"><label htmlFor="region">YOUR COUNTRY <select id="region" name="region" defaultValue={region}>{countries.map(c => <option value={c.code} key={c.code}>{c.name}</option>)}</select></label><button type="submit">Update view →</button></form>
    <Grid items={data.items}/>
    <div className="paging">{page > 1 && <a href={'/free-movies?region=' + region + '&page=' + (page-1)}>← Previous</a>}<span>PAGE {String(page).padStart(2,'0')}</span>{page < data.pages && <a href={'/free-movies?region=' + region + '&page=' + (page+1)}>Next →</a>}</div>
    <p className="source-note">Free-to-watch discovery is based on TMDB watch-provider records, which incorporate JustWatch data. This is an availability directory, not a streaming or hosting service; offerings depend on your region and may require ads or an account.</p>
  </div>
}
