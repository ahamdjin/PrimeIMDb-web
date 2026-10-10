# Prime IMDb Web — Seven-provider API integration

Prime IMDb Web is based on the original MIT-licensed Screenbox (Next.js). The catalog is API-only: no database or persistent movie index.

| Provider | Vercel variable | Purpose |
|---|---|---|
| TMDB | TMDB_API_READ_TOKEN or TMDB_API_KEY | Required primary movies, TV, images, cast, trailers, discovery and TMDB/JustWatch availability |
| OMDb | OMDB_API_KEY | Optional awards and independently labelled ratings matched by IMDb ID |
| Watchmode | WATCHMODE_API_KEY | Optional region-specific streaming options and provider links when available |
| TVmaze | ENABLE_TVMAZE=true | Optional TV statuses and networks from exact IMDb IDs |
| TheTVDB | THETVDB_API_KEY and optional THETVDB_PIN | Optional TV metadata matched using a TMDB-supplied TVDB ID |
| NYT Movie Reviews | NYT_MOVIE_REVIEWS_API_KEY | Optional linked critics' reviews for exact title and approximate release year |
| Wikidata | ENABLE_WIKIDATA=true | Optional linked entity and publicly reusable CC0 facts |

All API secrets are server-side. Do not prefix them with NEXT_PUBLIC_. NEXT_PUBLIC_SITE_URL is the non-secret canonical HTTPS URL.

## Activation / QA

1. Set TMDB_API_READ_TOKEN in the Vercel Production environment, then redeploy.
2. Verify Home, a movie, a TV series, /free-movies?region=US, /sitemap.xml and /robots.txt.
3. Add each optional key separately, redeploy and check the additional data panel on title pages.
4. Check that missing or invalid optional keys do not prevent core movie pages from loading.
5. Confirm source labels, rating scales and official viewing-provider links match provider data.
6. Monitor API quotas and response times. Watchmode using a TMDB ID can cost 2 credits per title; its results are cached by Next.js for 12 hours.
7. Run npm ci, npm run type-check, npm run lint, and npm run build.

## Limitations

API keys cannot reproduce IMDb's proprietary reviews, voting community, or full archive. Search indexing is currently limited to discovered titles; the initial sitemap is selective.
Licensing: TMDB noncommercial/free developer terms and attribution apply. OMDb, TheTVDB, NYT and Watchmode have separate contractual terms. Review TVmaze share-alike and trademark issues with Prime IMDb before launch.