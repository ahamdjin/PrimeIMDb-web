"use server";

import {
  fetchMovieGenres,
  fetchPopularMovies,
  fetchPopularTVShows,
  fetchTrending,
  fetchUpcomingMovies,
  discoverMovies,
} from "@/lib/api/tmdb";

export async function getHomePageData() {
  const [trendingDay, trendingWeek, popular, popularTV, upcoming, genresData, freeMovies] =
    await Promise.all([
      fetchTrending("all", "day"),
      fetchTrending("all", "week"),
      fetchPopularMovies(1),
      fetchPopularTVShows(1),
      fetchUpcomingMovies(1),
      fetchMovieGenres(),
      discoverMovies({ watch_region: "US", with_watch_monetization_types: "free|ads", sort_by: "popularity.desc", page: 1 }),
    ]);

  return {
    trendingDay: trendingDay.results,
    trendingWeek: trendingWeek.results,
    popularMovies: popular.results,
    popularTV: popularTV.results,
    upcoming: upcoming.results,
    genres: genresData.genres,
    freeMovies: freeMovies.results,
  };
}
