# OpenPlay Next.js SEO Frontend (Map View) — Fixed Build

**Fix applied:** Split server-only code and client utilities to resolve the Vercel build error.

- `lib/server.ts` — `fetchExport()` (uses `import 'server-only'`)
- `lib/utils.ts` — client-safe helpers (day/time formatting, haversine, groupBy, slugify)
- Client components import from `lib/utils`

## Env Vars (Vercel)
- `EXPORT_URL` — e.g., https://openplay.replit.app/api/export
- `FALLBACK_EXPORT_URL` — optional
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — Google Maps key (enable Maps JavaScript API)

## Routes
- `/map` — Google Maps with day/time + "near me" filtering
- `/:state`, `/:state/:city`, `/:state/:city/:slug` — SSR/ISR pages with JSON-LD
- Sitemaps & robots included
