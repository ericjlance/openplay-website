import 'server-only'
import { Venue } from './types'
import { slugify } from './utils'

const envUrl = process.env.EXPORT_URL
const fallback = process.env.FALLBACK_EXPORT_URL || 'https://openplay.replit.app/api/export'

function heal(url?: string | null){
  if (!url) return fallback
  return url.replace('openplauy', 'openplay')
}

export type ExportResponse = Venue[] | { venues: Venue[], export_generated_at?: string }

export async function fetchExport(): Promise<{ venues: Venue[], export_generated_at?: string }> {
  const url = heal(envUrl) || fallback
  const res = await fetch(url, { next: { revalidate: 300 }, headers: { 'Accept': 'application/json' } })
  if (!res.ok) throw new Error(`Export fetch failed: ${res.status}`)
  const data: ExportResponse = await res.json()
  const venues = Array.isArray(data) ? data : (data.venues || [])
  const export_generated_at = Array.isArray(data) ? undefined : data.export_generated_at

  const normalized: Venue[] = venues.map((v: any) => ({
    slug: v.slug || slugify(v.name || ''),
    name: v.name || 'Unknown Venue',
    address: v.address || '',
    city: v.city || '',
    state: v.state || '',
    lat: v.lat ?? null,
    lng: v.lng ?? null,
    indoor: !!v.indoor,
    outdoor: !!v.outdoor,
    cost: v.cost || v.price || '',
    phone: v.phone || '',
    website: v.website || v.url || '',
    status: v.status || '',
    amenities: v.amenities || [],
    open_play: Array.isArray(v.open_play) ? v.open_play : [],
    rating: v.rating ?? null,
    reviews_ct: v.reviews_ct ?? v.review_count ?? null,
    last_verified_at: v.last_verified_at || v.updated_at || export_generated_at || null,
    stale: !!v.stale,
    confidence: typeof v.confidence === 'number' ? v.confidence : null,
    photos: v.photos || [],
    source: v.source || ''
  }))

  return { venues: normalized, export_generated_at }
}
