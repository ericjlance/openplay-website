# OpenPlay Next.js SEO Frontend (Map View)

- App Router + TypeScript
- ISR (revalidate 300s)
- Dynamic routes: `/[state]`, `/[state]/[city]`, `/[state]/[city]/[slug]`
- **Google Maps map view** with filters: day of week, start/end time, indoor/outdoor, near-me radius

## Environment Variables (Vercel)
- `EXPORT_URL` — your Replit export endpoint (e.g., https://openplauy.replit.app/api/export)
- `FALLBACK_EXPORT_URL` — optional fallback (e.g., https://openplay.replit.app/api/export)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — your Google Maps API key (enable Maps JavaScript API)

> We also check `GOOGLE_MAPS_API_KEY` for local dev if you prefer not to expose it. For the browser, set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.

## Deploy (Vercel)
1. Import repo into Vercel.
2. Add env vars above.
3. Deploy. Update `metadataBase` in `app/layout.tsx` and `app/sitemap.ts` to your live domain.

## Map Filters
- **Near Me**: uses browser geolocation; you can adjust radius (miles).
- **Day/Time**: picks venues whose open_play windows overlap your selected start/end on the chosen day.
- **Indoor/Outdoor**: simple boolean filter.

## SEO
- Venue pages render JSON-LD for SportsActivityLocation + Event schedules.
- Sitemaps include `/map`, states, cities, and venues.

