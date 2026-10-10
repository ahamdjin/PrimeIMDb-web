import type { Enrichment } from "@/lib/api/enrichment";
import { Award, ExternalLink, Globe, Star, Newspaper, Clapperboard, Info } from "lucide-react";

export const regions: Record<string, string> = {
  US: "United States", GB: "United Kingdom", CA: "Canada", AU: "Australia",
  IN: "India", PK: "Pakistan", DE: "Germany", FR: "France", JP: "Japan", KR: "South Korea",
};

export function safeRegion(region?: string) {
  return region && Object.prototype.hasOwnProperty.call(regions, region.toUpperCase())
    ? region.toUpperCase() : "US";
}

export function EnrichmentPanel({
  data, region, kind,
}: { data: Enrichment; region: string; kind: "movie" | "tv" }) {
  const hasContent = data.ratings.length || data.awards || data.reviews.length
    || data.viewing.length || data.television?.length || data.facts?.length;
  return (
    <section className="mx-4 space-y-6 sm:mx-8" aria-label="Additional title information">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber">More movie intelligence</p>
          <h2 className="font-display text-2xl font-bold text-primary sm:text-3xl">Ratings, reviews & viewing options</h2>
          <p className="mt-1 text-xs text-muted-foreground">Information is attributed to each provider. Scores use their original scales.</p>
        </div>
        <form method="GET" className="flex items-center gap-2">
          <Globe size={17} className="text-amber" aria-hidden="true"/>
          <label htmlFor="movie-region" className="text-xs text-muted-foreground">Availability region</label>
          <select id="movie-region" name="region" defaultValue={region}
            className="rounded-lg border border-white/20 bg-secondary px-3 py-2 text-sm">
            {Object.entries(regions).map(([code,name]) => <option key={code} value={code}>{name}</option>)}
          </select>
          <button type="submit" className="rounded-lg bg-amber px-3 py-2 text-xs font-bold text-amber-foreground">Update</button>
        </form>
      </div>
      {!hasContent ? (
        <p className="rounded-xl border border-white/10 bg-secondary/30 px-5 py-6 text-sm text-muted-foreground">
          Additional ratings and availability will appear here when compatible API integrations are configured. Core movie information comes from TMDB.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {(data.ratings.length > 0 || data.awards) && (
            <section className="space-y-4 rounded-xl border border-white/10 bg-secondary/40 p-5">
              <h3 className="flex items-center gap-2 font-bold"><Star className="h-5 w-5 text-amber"/> External ratings & awards</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {data.ratings.map((rating,i) =>
                  <div key={rating.source + i} className="rounded-lg border border-white/10 bg-background/40 p-3">
                    <p className="mb-2 text-xs text-muted-foreground">{rating.source}</p>
                    <strong className="text-xl text-primary">{rating.value}</strong>
                  </div>)}
              </div>
              {data.awards && <p className="flex items-start gap-2 text-sm leading-6 text-muted-foreground"><Award className="mt-1 h-4 w-4 shrink-0 text-amber"/>{data.awards}</p>}
              <p className="text-xs text-muted-foreground">Source: OMDb. Ratings are reproduced individually, not combined into a misleading score.</p>
            </section>
          )}
          {data.viewing.length > 0 && (
            <section className="space-y-4 rounded-xl border border-white/10 bg-secondary/40 p-5">
              <h3 className="flex items-center gap-2 font-bold"><Clapperboard className="h-5 w-5 text-amber"/> More places to watch in {regions[region]}</h3>
              <div className="space-y-2">
                {data.viewing.slice(0,16).map((offer,i) =>
                  <div key={offer.provider + offer.category + i} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-background/40 px-3 py-2 text-sm">
                    <span className="font-medium">{offer.provider}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{offer.category}{offer.price ? " · " + offer.price : ""}</span>
                    {offer.url && <a href={offer.url} target="_blank" rel="noopener noreferrer nofollow" className="text-amber"
                      aria-label={"Visit " + offer.provider}><ExternalLink size={15}/></a>}
                  </div>)}
              </div>
              <p className="text-xs text-muted-foreground">Source: Watchmode. Offerings change; verify availability, price and rights on each provider&apos;s site.</p>
            </section>
          )}
          {kind === "movie" && data.reviews.length > 0 && (
            <section className="space-y-4 rounded-xl border border-white/10 bg-secondary/40 p-5">
              <h3 className="flex items-center gap-2 font-bold"><Newspaper className="h-5 w-5 text-amber"/> Critics&apos; reviews</h3>
              {data.reviews.map((review,i) => <article key={review.url + i} className="space-y-2 border-b border-white/10 pb-4 last:border-0">
                <a href={review.url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 font-semibold hover:text-amber">{review.title}<ExternalLink size={13}/></a>
                <p className="text-xs text-muted-foreground">{review.critic && "By " + review.critic}{review.date && " · " + review.date}{review.criticsPick && " · Critics' Pick"}</p>
                {review.summary && <p className="text-sm leading-6 text-muted-foreground">{review.summary}</p>}
              </article>)}
              <p className="text-xs text-muted-foreground">Source: The New York Times Movie Reviews API. Read full coverage on NYTimes.com.</p>
            </section>
          )}
          {kind === "tv" && !!data.television?.length && (
            <section className="space-y-3 rounded-xl border border-white/10 bg-secondary/40 p-5">
              <h3 className="font-bold">Television networks & status</h3>
              {data.television.map((item,i) => <div key={item.source + i} className="rounded-lg bg-background/40 p-3 text-sm">
                <strong>{item.source}</strong>
                <p className="mt-1 text-muted-foreground">{[item.status, item.network, item.firstAired].filter(Boolean).join(" · ")}</p>
                {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer nofollow" className="mt-2 inline-flex items-center gap-1 text-xs text-amber">Source page <ExternalLink size={12}/></a>}
              </div>)}
            </section>
          )}
          {!!data.facts?.length && (
            <section className="space-y-2 rounded-xl border border-white/10 bg-secondary/40 p-5">
              <h3 className="flex items-center gap-2 font-bold"><Info className="h-5 w-5 text-amber"/> Linked facts</h3>
              {data.facts.map((fact,i) => <div key={i} className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">{fact.label}</span>
                {fact.url ? <a href={fact.url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 text-sm text-amber">{fact.value}<ExternalLink size={12}/></a> : <strong className="text-sm">{fact.value}</strong>}
              </div>)}
              <p className="text-xs text-muted-foreground">Wikidata · CC0 structured facts.</p>
            </section>
          )}
        </div>
      )}
    </section>
  );
}
