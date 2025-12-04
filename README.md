# OpenPlay Next.js + Google Maps (v1.0.1)

This build fixes the Google Maps types, removes `api.ts`, adds a server-only fetcher, and includes your requested `.env.production`.

## What changed
- ✅ `lib/server.ts` SSR fetcher from `EXPORT_URL`
- ✅ `lib/types.ts` now exports `ExportResponse`
- ✅ `components/MapView.tsx` corrected
- ✅ `.env.production` included with your values
- ✅ No `api.ts`, no server-only imports in client code
 
## Deploy (Vercel)
1. Delete existing repo files and replace with this ZIP's contents.
2. Push to your Git provider (or import directly to Vercel).
4. Visit `/map`, `/{STATE}`, `/{STATE}/{city}`, `/{STATE}/{city}/{slug}`.
