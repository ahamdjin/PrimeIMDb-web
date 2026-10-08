# Prime IMDb Web (TanStack Start)

An independent, SSR movie and TV discovery site with official viewing links and free-watch discovery. Built with **TanStack Start + TanStack Router + Vite + React 19**. Separate from the playback app.

## Local setup

```sh
npm install
cp .env.example .env
npm run dev
```

Provide `TMDB_API_READ_TOKEN` (or `TMDB_API_KEY`) and `SITE_URL` in your hosting environment. Do **not** expose secrets with `VITE_`.

Pages: `/`, `/movies`, `/tv`, `/free-movies?region=US`, `/genres`, `/genre/:id`, `/search?q=...`, `/movie/:id`, `/tv/:id`, `/person/:id`, `/robots.txt`, `/sitemap.xml`.

**Before monetizing:** TMDB's API license differs for commercial vs. noncommercial use. Verify the appropriate license, TMDB attribution and JustWatch attribution requirements. Free-to-watch availability is region-specific and can change. **Don't claim third-party content is licensed for playback** based on metadata or a watch-provider entry.

The initial sitemap lists the major public routes; title/actor URL sitemap generation and editorial pages are follow-up SEO tasks. Add a custom domain and replace Prime IMDb branding after trademark review.
