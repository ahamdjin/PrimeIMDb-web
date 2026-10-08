import { createFileRoute, notFound } from '@tanstack/react-router'
import { getPerson } from '../lib/server'
import { image, type Movie, type Kind } from '../lib/tmdb'
import { Grid } from '../components/Cards'
import { canonical, schema } from '../lib/seo'
export const Route = createFileRoute('/person/$id')({
  loader: async ({ params }) => {
    if (!/^\d+$/.test(params.id)) throw notFound()
    const value = await getPerson({ data: { id: Number(params.id) } })
    if (!value?.id || value.adult) throw notFound()
    return value
  },
  head: ({ loaderData, params }) => ({
    meta: [
      { title: (loaderData?.name || 'Artist') + ' — Biography & Filmography | Prime IMDb' },
      { name: 'description', content: 'Explore the biography, films and TV projects of ' + (loaderData?.name || 'a screen artist') + '.' },
    ],
    links: canonical('/person/' + params.id),
    scripts: schema({ '@context': 'https://schema.org', '@type': 'Person', name: loaderData?.name, description: loaderData?.biography?.slice(0, 280), image: image(loaderData?.profile_path) }),
  }),
  component: Page,
})
function Page() {
  const person = Route.useLoaderData()
  const raw = (person.combined_credits?.cast || []) as any[]
  const keys = new Set<string>()
  const credits: Movie[] = raw.filter(entry => {
    if (!['tv','movie'].includes(entry.media_type) || !Number.isInteger(entry.id)) return false
    const key = entry.media_type + '-' + entry.id
    if (keys.has(key)) return false
    keys.add(key)
    return true
  }).sort((a,b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0,24).map(entry => ({
      id: entry.id, kind: entry.media_type as Kind, title: entry.title || entry.name,
      year: String(entry.release_date || entry.first_air_date || '').slice(0,4),
      overview: entry.overview || '', poster: image(entry.poster_path), backdrop: image(entry.backdrop_path,'w1280'),
      rating: Number(entry.vote_average || 0), votes: Number(entry.vote_count || 0), genres: [],
    }))
  return <div className="page-container inner-page">
    <header className="bio page-lead"><div>{person.profile_path ? <img src={image(person.profile_path)||''} alt={person.name}/> : <div className="avatar-missing">✳</div>}</div>
      <div><span className="eyebrow">PEOPLE BEHIND THE PICTURES</span><h1>{person.name}</h1>
        <p className="source-note">{person.known_for_department || 'Film & television'}{person.place_of_birth ? ' • ' + person.place_of_birth : ''}</p>
        <p>{person.biography || 'A biography has not yet been provided by our metadata source.'}</p>
      </div>
    </header>
    <section className="editorial-section"><div className="section-heading"><div><span className="eyebrow">SELECTED WORK</span><h2>The filmography.</h2></div></div><Grid items={credits}/></section>
  </div>
}
