import { createFileRoute } from '@tanstack/react-router'
import { getBrowse } from '../lib/server'
import { Grid } from '../components/Cards'
import { canonical } from '../lib/seo'
export const Route = createFileRoute('/tv')({
  validateSearch: (s: Record<string, unknown>) => ({ page: Math.max(1, Math.min(500, Number(s.page) || 1)) }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => getBrowse({ data: { kind: 'tv', page: deps.page } }),
  head: () => ({ meta: [{ title: 'Television & Series — Discover What to Watch | Prime IMDb' },
    { name: 'description', content: 'Discover notable television series, cast details, season guides, show information and official viewing options.' }],
    links: canonical('/tv') }),
  component: Page,
})
function Page() {
  const data = Route.useLoaderData(), { page } = Route.useSearch()
  return <div className="page-container inner-page">
    <header className="page-lead"><span className="eyebrow">ARCHIVE NO. 02 / THE SMALL SCREEN</span><h1>Stay for <em>another episode.</em></h1><p>Exceptional television in every genre. Explore the shows that pull us in and never quite let go.</p></header>
    <Grid items={data.items}/>
    <div className="paging">{page > 1 && <a href={'/tv?page=' + (page-1)}>← Previous issue</a>}<span>PAGE {String(page).padStart(2,'0')}</span>{page < data.pages && <a href={'/tv?page=' + (page+1)}>Next issue →</a>}</div>
  </div>
}
