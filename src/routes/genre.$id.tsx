import { createFileRoute, notFound } from '@tanstack/react-router'
import { getBrowse, getGenres } from '../lib/server'
import { Grid } from '../components/Cards'
import { canonical } from '../lib/seo'
export const Route = createFileRoute('/genre/$id')({
  loader: async ({ params }) => {
    if (!/^\d+$/.test(params.id)) throw notFound()
    const [results, names] = await Promise.all([
      getBrowse({ data: { kind: 'movie', genre: Number(params.id) } }),
      getGenres(),
    ])
    return { results, name: names.find(g => g.id === Number(params.id))?.name || 'Films' }
  },
  head: ({ loaderData, params }) => ({
    meta: [{ title: (loaderData?.name || 'Genre') + ' Movies — Explore Films | Prime IMDb' },
      { name: 'description', content: 'Find films and official viewing information in the ' + (loaderData?.name || 'selected') + ' genre.' }],
    links: canonical('/genre/' + params.id),
  }),
  component: Page,
})
function Page() {
  const data = Route.useLoaderData()
  return <div className="page-container inner-page">
    <header className="page-lead"><span className="eyebrow">EXPLORE / CINEMA BY GENRE</span><h1>{data.name}<em> films.</em></h1><p>One genre. Countless perspectives. Browse and find what speaks to you.</p></header>
    <Grid items={data.results.items}/>
  </div>
}
