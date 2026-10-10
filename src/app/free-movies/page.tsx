import { MediaCard } from "@/components/media/media-card";
import { discoverMovies } from "@/lib/api/tmdb";
import type { Metadata } from "next";
import Link from "next/link";

const countries: Record<string,string> = {
  US:"United States", GB:"United Kingdom", CA:"Canada", AU:"Australia",
  IN:"India", PK:"Pakistan", DE:"Germany", FR:"France", JP:"Japan", KR:"South Korea",
};
export const metadata: Metadata = {
  title: "Free Movies to Watch Legally | Prime IMDb",
  description: "Explore movies available free or with ads through legitimate streaming services. Find legal free movies and check availability in your country.",
  alternates: { canonical:"/free-movies" },
};
export default async function FreeMoviesPage({
  searchParams,
}: { searchParams: Promise<{region?:string;page?:string}> }) {
  const query = await searchParams;
  const region = query.region && countries[query.region.toUpperCase()] ? query.region.toUpperCase() : "US";
  const page = Math.max(1, Math.min(500, Math.floor(Number(query.page)||1)));
  const result = await discoverMovies({
    page,
    watch_region:region,
    with_watch_monetization_types:"free|ads",
    sort_by:"popularity.desc",
  });
  return <main className="flex flex-1 flex-col gap-7 px-4 py-8 sm:px-8">
    <header className="space-y-3">
      <div className="inline-flex rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">FREE / AD-SUPPORTED DISCOVERY</div>
      <h1 className="font-display text-3xl font-bold text-primary sm:text-5xl">Find movies you can watch for free</h1>
      <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
        Discover films listed as free or ad-supported in {countries[region]}. Availability changes by country, service and date.
        Check the official provider before watching. We do not host or stream these titles.
      </p>
      <form method="GET" className="flex flex-wrap items-center gap-3">
        <label htmlFor="country" className="text-sm text-muted-foreground">Your country</label>
        <select id="country" name="region" defaultValue={region}
          className="rounded-lg border border-white/15 bg-secondary px-4 py-2 text-sm">
          {Object.entries(countries).map(([code,name])=><option value={code} key={code}>{name}</option>)}
        </select>
        <button type="submit" className="rounded-lg bg-amber px-4 py-2 text-sm font-semibold text-amber-foreground">Find free titles</button>
      </form>
    </header>
    {result.results.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
      {result.results.map((movie,i)=><MediaCard key={movie.id} id={movie.id} title={movie.title}
        posterPath={movie.poster_path} rating={movie.vote_average} year={movie.release_date}
        mediaType="movie" index={i}/>)}
    </div> : <section className="rounded-xl border border-white/10 bg-secondary/50 p-8 text-sm text-muted-foreground">
      No free-viewing listings are available yet. Add a TMDB key or try another country.
    </section>}
    {result.total_pages > 1 && <nav aria-label="Free movies pagination" className="flex justify-center gap-4 text-sm">
      {page > 1 && <Link href={"/free-movies?region="+region+"&page="+(page-1)} className="rounded-md bg-secondary px-5 py-3">← Previous</Link>}
      <span className="self-center text-muted-foreground">Page {page}</span>
      {page < Math.min(500,result.total_pages) && <Link href={"/free-movies?region="+region+"&page="+(page+1)} className="rounded-md bg-secondary px-5 py-3">Next →</Link>}
    </nav>}
    <p className="max-w-3xl text-xs leading-6 text-muted-foreground">Availability information is provided by TMDB / JustWatch and is not a guarantee that a title is available for free right now. Some services require an account and display advertisements.</p>
  </main>;
}
