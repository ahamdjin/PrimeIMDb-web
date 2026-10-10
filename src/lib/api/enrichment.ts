import "server-only";

import { tmdbFetch } from "@/lib/api/tmdb";

export type MovieKind = "movie" | "tv";
export type SourceRating = { source: string; value: string; link?: string };
export type ViewingOffer = {
  provider: string; category: string; url?: string; region: string; price?: string;
};
export type CriticReview = {
  title: string; critic?: string; date?: string; summary?: string; url: string; criticsPick: boolean;
};
export type Enrichment = {
  ratings: SourceRating[];
  awards?: string;
  viewing: ViewingOffer[];
  reviews: CriticReview[];
  television?: { status?: string; network?: string; firstAired?: string; source: string; url?: string }[];
  facts?: { label: string; value: string; url?: string }[];
  imdbId?: string;
};

const fetchJSON = async <T,>(
  url: string, options: { headers?: Record<string,string>; method?: "GET" | "POST"; body?: string; ttl?: number } = {},
): Promise<T | null> => {
  try {
    const response = await fetch(url, {
      method: options.method || "GET",
      body: options.body,
      headers: { Accept: "application/json", ...options.headers },
      next: { revalidate: options.ttl ?? 12 * 3600 },
      signal: AbortSignal.timeout(7500),
    });
    return response.ok ? await response.json() as T : null;
  } catch {
    return null;
  }
};
function safeLink(url: unknown): string | undefined {
  if (typeof url !== "string") return undefined;
  try { return new URL(url).protocol === "https:" ? url : undefined; } catch { return undefined; }
}
const normalizeTitle = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, "");

async function omdb(imdbId?: string): Promise<Pick<Enrichment, "ratings" | "awards"> | null> {
  const key = process.env.OMDB_API_KEY;
  if (!key || !imdbId || !/^tt\d+$/.test(imdbId)) return null;
  const url = new URL("https://www.omdbapi.com/");
  url.searchParams.set("apikey", key);
  url.searchParams.set("i", imdbId);
  url.searchParams.set("plot", "short");
  type Data = { Response?: string; Awards?: string; Ratings?: {Source:string; Value:string}[] };
  const data = await fetchJSON<Data>(url.toString());
  if (data?.Response !== "True") return null;
  const ratings = (data.Ratings || [])
    .filter(x => x.Source && x.Value && x.Value !== "N/A")
    .slice(0, 5)
    .map(x => ({ source: x.Source, value: x.Value }));
  return {
    ratings,
    awards: data.Awards && data.Awards !== "N/A" ? data.Awards.slice(0, 300) : undefined,
  };
}

async function watchmode(kind: MovieKind, tmdbId: number, region: string): Promise<ViewingOffer[]> {
  const key = process.env.WATCHMODE_API_KEY;
  if (!key) return [];
  // Watchmode accepts "movie-278" / "tv-1396" identifiers. Such lookups
  // cost more credits than native Watchmode IDs; revalidate for 12 hours.
  const url = new URL("https://api.watchmode.com/v1/title/" + kind + "-" + tmdbId + "/sources/");
  url.searchParams.set("regions", region);
  type Data = {name?:string;type?:string;region?:string;web_url?:string;price?:number|null}[];
  const data = await fetchJSON<Data>(url.toString(), {
    headers: { "X-API-Key": key },
    ttl: 12 * 3600,
  });
  if (!Array.isArray(data)) return [];
  return data.filter(x => x.name && x.region === region).slice(0, 30)
    .map(x => ({
      provider: x.name!,
      category: x.type === "free" || x.type === "ads" ? "Free / ads"
        : x.type === "sub" ? "Subscription"
        : x.type === "rent" ? "Rent"
        : x.type === "buy" ? "Buy" : "Other",
      region,
      url: safeLink(x.web_url),
      price: typeof x.price === "number" && x.price > 0 ? "$" + x.price.toFixed(2) : undefined,
    }));
}

async function tvmaze(imdbId?: string): Promise<NonNullable<Enrichment["television"]>[number] | null> {
  if (process.env.ENABLE_TVMAZE !== "true" || !imdbId) return null;
  const url = "https://api.tvmaze.com/lookup/shows?imdb=" + encodeURIComponent(imdbId);
  type Data = { status?:string;network?:{name?:string};webChannel?:{name?:string};premiered?:string;url?:string };
  const data = await fetchJSON<Data>(url);
  if (!data) return null;
  return { status: data.status, network: data.network?.name || data.webChannel?.name,
    firstAired: data.premiered, source: "TVmaze", url: safeLink(data.url) };
}

let tvdbToken: { token:string; expires:number } | undefined;
async function thetvdb(tvdbId?: number): Promise<NonNullable<Enrichment["television"]>[number] | null> {
  const key = process.env.THETVDB_API_KEY;
  if (!key || !tvdbId || !Number.isSafeInteger(tvdbId) || tvdbId < 1) return null;
  if (!tvdbToken || tvdbToken.expires < Date.now()) {
    const login = await fetchJSON<{ data?:{token?:string} }>("https://api4.thetvdb.com/v4/login", {
      method: "POST", ttl: 0,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apikey: key, ...(process.env.THETVDB_PIN ? { pin: process.env.THETVDB_PIN } : {}) }),
    });
    if (!login?.data?.token) return null;
    tvdbToken = { token: login.data.token, expires: Date.now() + 25 * 24 * 3600_000 };
  }
  type Data = { data?:{ status?:{name?:string}; firstAired?:string; slug?:string; originalNetwork?:{name?:string} } };
  const info = await fetchJSON<Data>("https://api4.thetvdb.com/v4/series/" + tvdbId + "/extended", {
    headers: {Authorization: "Bearer " + tvdbToken.token},
  });
  if (!info?.data) return null;
  return { status: info.data.status?.name, firstAired: info.data.firstAired,
    network: info.data.originalNetwork?.name, source: "TheTVDB",
    url: info.data.slug && /^[a-z0-9-]+$/.test(info.data.slug)
      ? "https://thetvdb.com/series/" + info.data.slug : undefined };
}

async function nyt(name: string, year: number): Promise<CriticReview[]> {
  const key = process.env.NYT_MOVIE_REVIEWS_API_KEY;
  if (!key || !name || name.length > 110) return [];
  const url = new URL("https://api.nytimes.com/svc/movies/v2/reviews/search.json");
  url.searchParams.set("query", name);
  url.searchParams.set("api-key", key);
  type Data = {results?:{display_title?:string;headline?:string;byline?:string;
    summary_short?:string;publication_date?:string;opening_date?:string;critics_pick?:number|string;
    link?:{url?:string}}[]};
  const data = await fetchJSON<Data>(url.toString(), {ttl: 24 * 3600});
  return (data?.results || []).filter(x => {
    if (!x.display_title || normalizeTitle(x.display_title) !== normalizeTitle(name)) return false;
    const opened = Number(x.opening_date?.slice(0,4));
    // Distinguish between adaptations/remakes of identical titles.
    return !year || !opened || Math.abs(opened - year) <= 1;
  }).slice(0, 3).flatMap(x => {
    const url = safeLink(x.link?.url);
    return url ? [{title: x.headline || x.display_title!, critic:x.byline, date:x.publication_date,
      summary:x.summary_short?.slice(0, 240), url, criticsPick: x.critics_pick === 1 || x.critics_pick === "Y"}] : [];
  });
}

async function wikidata(imdbId?: string): Promise<NonNullable<Enrichment["facts"]>> {
  if (process.env.ENABLE_WIKIDATA !== "true" || !imdbId || !/^tt\d+$/.test(imdbId)) return [];
  const query = 'SELECT ?item ?itemLabel WHERE { ?item wdt:P345 "' + imdbId +
    '" . SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } } LIMIT 2';
  const url = new URL("https://query.wikidata.org/sparql");
  url.searchParams.set("query", query);
  url.searchParams.set("format", "json");
  type Data = {results?:{bindings?:{item?:{value:string};itemLabel?:{value:string}}[]}};
  const data = await fetchJSON<Data>(url.toString(), {ttl: 7 * 24 * 3600});
  return (data?.results?.bindings || []).flatMap(x => {
    const id = x.item?.value?.match(/^https?:\/\/www\.wikidata\.org\/entity\/(Q\d+)$/)?.[1];
    return id ? [{label:"Wikidata", value:x.itemLabel?.value || id,
      url:"https://www.wikidata.org/wiki/" + id}] : [];
  });
}

export async function enrichTitle(kind: MovieKind, tmdbId: number, title: string,
  year: number, imdbFromMovie?: string, region = "US"): Promise<Enrichment> {
  const country = /^[A-Z]{2}$/.test(region) ? region : "US";
  let imdbId = imdbFromMovie && /^tt\d+$/.test(imdbFromMovie) ? imdbFromMovie : undefined;
  let tvdbId: number | undefined;
  if (kind === "tv") {
    try {
      const external = await tmdbFetch<{imdb_id?:string;tvdb_id?:number}>("/tv/" + tmdbId + "/external_ids");
      if (/^tt\d+$/.test(external?.imdb_id || "")) imdbId = external.imdb_id;
      if (Number.isSafeInteger(external?.tvdb_id)) tvdbId = external.tvdb_id;
    } catch { /* Core TMDB details remain authoritative */ }
  }
  const [scores, sources, maze, tvdb, reviews, facts] = await Promise.all([
    omdb(imdbId),
    watchmode(kind, tmdbId, country),
    kind === "tv" ? tvmaze(imdbId) : Promise.resolve(null),
    kind === "tv" ? thetvdb(tvdbId) : Promise.resolve(null),
    kind === "movie" ? nyt(title, year) : Promise.resolve([]),
    wikidata(imdbId),
  ]);
  return {
    ratings: scores?.ratings || [], awards: scores?.awards,
    viewing: sources, reviews,
    television: [maze,tvdb].filter((x): x is NonNullable<typeof x> => x !== null),
    facts, imdbId,
  };
}
