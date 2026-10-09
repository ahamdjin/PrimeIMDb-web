# Prime IMDb Web — Screenbox-inspired movie discovery, API-only

A responsive, dark, cinematic movie and television discovery website built with TanStack Start, TanStack Router, Vite, Nitro, React 19, and third-party APIs. The design takes inspiration from [Screenbox](https://github.com/Lazhari/react-movies-finder): cinematic featured titles, compact poster rails, ratings, genre shortcuts and rich title pages. We have not copied its Next.js implementation.

## No database is required

This project does not use PostgreSQL, Prisma, MongoDB, Supabase, or any internal film catalog. Film pages use **TMDB IDs as canonical URLs** and fetch metadata from remote APIs server-side. Recent results use a bounded, short-lived **in-memory cache**, not permanent storage. Hosted instances can have separate caches.

### API keys / data providers

| Environment variable | Usage |
|---|---|
| TMDB_API_READ_TOKEN (or TMDB_API_KEY) | **Required**. Film/TV catalog, cast, posters, trailers, genres, recommendations and TMDB/JustWatch watch-provider data |
| OMDB_API_KEY | Optional. Additional IMDb-linked ratings and awards, displayed separately with source labels |
| WATCHMODE_API_KEY | Optional. Extra country-specific viewing providers and official deep links where provided. Credit-priced API; may charge 2 credits per title lookup by TMDB ID |
| ENABLE_TVMAZE=true | Optional. Public TVmaze API supplements TV status/network, matched by IMDb ID |
| SITE_URL | Your actual production HTTPS origin (robots/sitemap) |
| VITE_SITE_URL | **Public**, non-secret origin for canonical SEO links |

Do not prefix private keys with VITE_. The website works with TMDB alone; all other API providers add progressively richer data. Server-only third-party failures will not prevent TMDB title data from rendering.

## Implemented pages

- Home: Screenbox-style full-bleed hero slider, daily/weekly trends, popular movies and television, upcoming releases, free-watch area and genre shortcuts.
- /movies, /tv, /genres, /genre/:id, /free-movies with country selection, /search?q=...
- /movie/:id and /tv/:id: data-driven cast, crew, metadata, trailers, genre links, sources, ratings (TMDB and optional OMDb), optional TVmaze enrichment, and recommendations.
- /person/:id: biography and filmography.
- /watchlist: saved movie list in **your browser's localStorage** only, not a database. No account required. Watchlist is not synced across devices.
- /journal/how-to-watch-movies-free-legally: useful contextual editorial content.
- /robots.txt, /sitemap.xml: machine-readable discovery signals. Individual film pages get SEO metadata/JSON-LD based on API responses.

## Local setup

1. Copy .env.example to .env and add TMDB_API_READ_TOKEN.
2. Run npm install, then npm run dev.
3. Run npm run build and npm run typecheck before merging.

## Deploying on Vercel

Import the GitHub repository, use the TanStack Start framework, and add the API keys and your actual domain in Vercel Project → Settings → Environment Variables. Redeploy after changing variables.

## Performance and scale without a database

API-only catalogs are practical, but every uncached API request needs a network round trip and consumes quota. Add edge cache/CDN policies as traffic grows, monitor provider credits/quotas, and throttle abuse at the network edge. The current sitemap is intentionally limited to real, reasonably complete titles discovered from current API results. Building a genuinely comprehensive IMDb-scale archive and user-written reviews without any persistent storage will be limiting.

## Licenses and trademark checks

TMDB's free developer license is for noncommercial usage: get the proper commercial rights for advertising/affiliate monetization. Show the required official TMDB attribution logo and JustWatch attribution for viewing data, and respect the commercial terms of OMDb, TVmaze and Watchmode. Review “Prime IMDb” for trademark conflicts with IMDb and Prime Video before commercial launch.

Watch-provider listings cannot establish distribution rights for an embedded third-party player. This discovery site links to official viewing sources and does not host movies.
