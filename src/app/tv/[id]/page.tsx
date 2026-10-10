import { MediaCard } from "@/components/media/media-card";
import { MediaCarousel } from "@/components/media/media-carousel";
import { getProfileURL } from "@/lib/movies";
import { cn } from "@/lib/utils";
import Reviews from "@/components/movies/reviews";
import TVHero from "@/components/tv/hero";
import Seasons from "@/components/tv/seasons";
import { Users } from "lucide-react";
import { Metadata } from "next";
import { enrichTitle } from "@/lib/api/enrichment";
import { EnrichmentPanel, safeRegion } from "@/components/media/enrichment-panel";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTVShowPageData } from "../actions";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{region?:string}>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const { show } = await getTVShowPageData(Number(id));
    return {
      title: `${show.name} (${show.first_air_date?.slice(0,4) || "Series"}) — Cast, Seasons & Where to Watch | Prime IMDb`,
      alternates: { canonical: `/tv/${show.id}` },
      twitter: { card: "summary_large_image" },
      description: show.overview,
      openGraph: {
        title: show.name,
        description: show.overview,
        images: show.backdrop_path
          ? [`https://image.tmdb.org/t/p/w1280${show.backdrop_path}`]
          : [],
      },
    };
  } catch {
    return { title: "TV Show Not Found" };
  }
}

export default async function TVShowPage({ params, searchParams }: Props) {
  const { id } = await params;
  const showId = Number(id);
  if (!Number.isSafeInteger(showId) || showId < 1) notFound();

  let data;
  try {
    data = await getTVShowPageData(showId);
  } catch {
    notFound();
  }

  const {
    show,
    credits,
    trailerKey,
    reviews,
    recommendations,
    watchProvidersByRegion,
  } = data;
  const region = safeRegion((await searchParams).region);
  const watchProviders = watchProvidersByRegion[region];
  const enriched = await enrichTitle(
    "tv", show.id,
    show.name,
    Number(show.first_air_date?.slice(0, 4)) || 0,
    undefined, region,
  );

  // Split cast into lead (first 6) and supporting
  const leadCast = credits.cast.slice(0, 8);

  const tvSchema = {
    "@context": "https://schema.org", "@type": "TVSeries",
    name: show.name, description: show.overview,
    image: show.poster_path ? "https://image.tmdb.org/t/p/w500" + show.poster_path : undefined,
    datePublished: show.first_air_date || undefined,
    genre: show.genres.map(g => g.name),
    numberOfSeasons: show.number_of_seasons,
    numberOfEpisodes: show.number_of_episodes,
    actor: credits.cast.slice(0, 12).map(p => ({ "@type": "Person", name: p.name })),
    sameAs: enriched.imdbId ? "https://www.imdb.com/title/" + enriched.imdbId + "/" : undefined,
    ...(show.vote_average > 0 && show.vote_count > 0 ? {
      aggregateRating: { "@type": "AggregateRating", ratingValue: Number(show.vote_average.toFixed(1)),
        ratingCount: show.vote_count, bestRating: 10, worstRating: 0 },
    } : {}),
  };
  return (
    <main className="flex flex-1 flex-col gap-12 pb-16">
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(tvSchema).replace(/</g,"\\u003c")}} />
      <TVHero
        show={show}
        trailerKey={trailerKey}
        watchProviders={watchProviders}
      />

      {/* Seasons */}
      <Seasons showId={show.id} seasons={show.seasons} />

      {/* Cast */}
      {leadCast.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center gap-3 px-4 sm:px-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary sm:text-2xl">
                Cast
              </h2>
              <p className="text-xs text-muted-foreground">
                {credits.cast.length} credited member{credits.cast.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div
            className="flex gap-5 overflow-x-auto px-4 pb-2 sm:px-8"
            style={{ scrollbarWidth: "none" }}
          >
            {leadCast.map((member) => (
              <Link
                key={member.credit_id}
                href={`/actors/${member.id}`}
                className="group shrink-0 flex flex-col items-center gap-3 w-28"
              >
                <div
                  className={cn(
                    "relative h-24 w-24 overflow-hidden rounded-full ring-2 transition-all",
                    "ring-transparent group-hover:ring-primary/50",
                  )}
                >
                  {member.profile_path ? (
                    <Image
                      src={getProfileURL(member.profile_path, "medium")}
                      alt={member.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="96px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary text-lg font-bold text-muted-foreground">
                      {member.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="truncate text-sm font-medium transition-colors group-hover:text-primary w-28">
                    {member.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground w-28">
                    {member.character}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <EnrichmentPanel data={enriched} region={region} kind="tv" />

      {/* Reviews */}
      <Reviews reviews={reviews} />

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <MediaCarousel title="More Like This">
          {recommendations.map((rec, i) => (
            <div key={rec.id} className="w-[160px] shrink-0 sm:w-[185px]">
              <MediaCard
                id={rec.id}
                title={rec.name}
                posterPath={rec.poster_path}
                rating={rec.vote_average}
                year={rec.first_air_date}
                mediaType="tv"
                index={i}
              />
            </div>
          ))}
        </MediaCarousel>
      )}
    </main>
  );
}
