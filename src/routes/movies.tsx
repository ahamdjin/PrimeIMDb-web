import { createFileRoute } from '@tanstack/react-router'
import { getBrowse } from '../lib/server'
import { Grid } from '../components/Cards'
import { canonical } from '../lib/seo'
export const Route = createFileRoute('/movies')({
  validateSearch: (s: Record<string, unknown>) => ({ page: Math.max(1, Math.min(500, Number(s.page) || 1)) }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => getBrowse({ data: { kind: 'movie', page: deps.page } }),
  head: ({ loaderData }) => ({
    meta: [{ title: 'Films — A Curated Movie Discovery Guide | Prime IMDb' },
      { name: 'description', content: 'Explore popular and trending cinema, actors, directors, reviews and legal ways to watch each film.' },
      ...(loaderData?.items.length ? [] : [])],
    links: canonical('/movies'),
  }),
  component: Page,
})
function Page() {
  const data = Route.useLoaderData(), { page } = Route.useSearch()
  return <div className="page-container inner-page">
    <header className="page-lead"><span className="eyebrow">ARCHIVE NO. 01 / MOTION PICTURES</span><h1>The film <em>archive.</em></h1><p>A universe of films. Explore fresh discoveries, perennial favorites and the people who brought them to life.</p></header>
    <Grid items={data.items}/>
    <div className="paging">{page > 1 && <a href={'/movies?page=' + (page-1)}>← Previous issue</a>}<span>PAGE {String(page).padStart(2,'0')}</span>{page < data.pages && <a href={'/movies?page=' + (page+1)}>Next issue →</a>}</div>
  </div>
}
