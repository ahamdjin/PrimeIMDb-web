import { createFileRoute } from '@tanstack/react-router'
import { getSearch } from '../lib/server'
import { Grid } from '../components/Cards'
export const Route = createFileRoute('/search')({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s.q === 'string' ? s.q.slice(0, 100) : '' }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => deps.q.trim().length >= 2 ? getSearch({ data: { q: deps.q } }) : Promise.resolve([]),
  head: () => ({ meta: [{ title: 'Search the Film Archive | Prime IMDb' }, { name: 'robots', content: 'noindex,follow' }] }),
  component: Page,
})
function Page() {
  const items = Route.useLoaderData(), { q } = Route.useSearch()
  return <div className="page-container inner-page">
    <header className="page-lead"><span className="eyebrow">FIND THE STORY</span><h1>Search the <em>archive.</em></h1><p>Search movie and TV titles; discover what is worth your time.</p></header>
    <form action="/search" method="get" className="search-form"><input name="q" defaultValue={q} minLength={2} required placeholder="A film. A series. A story..." aria-label="Search for movies and shows"/><button type="submit">SEARCH ↗</button></form>
    {q && <p className="source-note">MATCHES FOR “{q}”</p>}
    <Grid items={items}/>
  </div>
}
