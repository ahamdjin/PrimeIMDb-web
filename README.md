# Prime IMDb Web — The Screen Journal

An editorial, server-rendered movie and television discovery publication built with TanStack Start, TanStack Router, Vite, Nitro and React 19. It is separate from the streaming app.

## Implemented

- Editorial homepage, film and TV archives, detailed title pages, cast filmographies, genre browsing, search, and free-watch discovery with country selector.
- Watch provider listings with accurate TMDB / JustWatch attribution and links to the availability directory, never unverified provider deep-links.
- TMDB canonical IDs and core metadata; optional OMDb ratings/awards and TVmaze status/network enrichment; server-side timeouts and bounded caching. Missing API data is never fabricated.
- SSR title metadata, Open Graph images, JSON-LD movie/person structured data, robots, 404 handling, real-title XML sitemaps, and public canonical URLs when a domain is set.
- Responsive editorial art direction with warm paper, deep forest and serif typography.

## Connect your APIs

Provide these environment variables in Vercel or a local .env file:
- TMDB_API_READ_TOKEN or TMDB_API_KEY (required, server-only)
- SITE_URL and VITE_SITE_URL (your final public https:// domain; VITE_SITE_URL is public only)
- OMDB_API_KEY (optional, subject to license)
- ENABLE_TVMAZE=true (optional enrichment)

## Run

npm install
npm run dev
npm run build
npm run typecheck

Nitro and vercel.json prepare the repository for Vercel deployment. Connect the Git repository in Vercel before deploying, then add the environment variables and redeploy.

## Before public SEO or commercial launch

TMDB's free API licensing is noncommercial; advertising and affiliate monetization can require a commercial data license. TMDB requires an approved logo and clear attribution. Verify the correct official logo asset prior to launch. JustWatch attribution is required for availability data. TVmaze and OMDb licensing/attribution must also be satisfied if enabled. Also review the Prime IMDb name for trademark issues.

The current dynamic sitemap intentionally covers a small, completeness-filtered discovery collection. For large catalog growth add PostgreSQL ingestion with incremental syncing, durable caches, human editorial selections and a static, partitioned sitemap index. Never publish hundreds of thousands of empty duplicate pages.
