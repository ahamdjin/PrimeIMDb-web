import { createFileRoute, Link } from '@tanstack/react-router'
import { getGenres } from '../lib/server'
import { canonical } from '../lib/seo'
export const Route = createFileRoute('/genres')({
  loader: () => getGenres(),
  head: () => ({ meta: [{ title: 'Explore Film Genres — Find Your Kind of Story | Prime IMDb' },
    { name: 'description', content: 'Browse cinema by genre: drama, comedy, action, horror, documentary and many more.' }],
    links: canonical('/genres') }),
  component: Page,
})
function Page() {
  const items = Route.useLoaderData()
  return <div className="page-container inner-page">
    <header className="page-lead"><span className="eyebrow">A GENRE FOR EVERY MOOD</span><h1>Follow your <em>curiosity.</em></h1><p>Stories travel in every direction. Choose your next adventure by the feeling it leaves behind.</p></header>
    <div className="genre-grid">{items.map(g => <Link key={g.id} to="/genre/$id" params={{ id: String(g.id) }}>{g.name}<span>↗</span></Link>)}</div>
  </div>
}
