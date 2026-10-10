import type { MetadataRoute } from "next";
import { fetchTrending, fetchPopularMovies, fetchPopularTVShows } from "@/lib/api/tmdb";
export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin=(process.env.NEXT_PUBLIC_SITE_URL || "https://prime-imdb-web.vercel.app").replace(/\/$/,"");
  const paths = ["/", "/upcoming", "/tv", "/genres", "/free-movies"];
  const list: MetadataRoute.Sitemap = paths.map(x=>({url:origin+x,changeFrequency:"daily",priority:x==="/" ? 1 : 0.8}));
  const sources = await Promise.allSettled([
    fetchTrending("movie","week"), fetchTrending("tv","week"),
    fetchPopularMovies(1), fetchPopularTVShows(1),
  ]);
  const seen = new Set<string>();
  for(const [i,source] of sources.entries()){
    if(source.status!=="fulfilled")continue;
    for(const entry of source.value.results){
      if(!entry.id || !entry.overview || !entry.poster_path || entry.vote_count < 5)continue;
      const type=i===1||i===3?"tv":"movies";
      const link=origin+"/"+type+"/"+entry.id;
      if(seen.has(link))continue;
      seen.add(link);
      list.push({url:link,changeFrequency:"weekly",priority:0.65});
    }
  }
  return list;
}
