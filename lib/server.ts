import 'server-only'
import { SITE_CONFIG } from '@/lib/config'
import { slugify } from '@/lib/utils'
import type { Venue, ExportResponse } from '@/lib/types'

export async function fetchExport(): Promise<{ venues: Venue[], export_generated_at?: string }> {
  const url = SITE_CONFIG.exportUrl
  const res = await fetch(url, { next: { revalidate: 300 }, headers: { 'Accept': 'application/json' } })
  if (!res.ok) throw new Error(`Export fetch failed: ${res.status}`)
  const data: ExportResponse = await res.json()
  const arr = Array.isArray(data) ? data : (data.venues || [])
  const stamp = Array.isArray(data) ? undefined : data.export_generated_at

  const venues: Venue[] = arr.map((v: any) => ({
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
    last_verified_at: v.last_verified_at || v.updated_at || stamp || null,
    stale: !!v.stale,
    confidence: typeof v.confidence === 'number' ? v.confidence : null,
    photos: v.photos || [],
    source: v.source || ''
  }))

  return { venues, export_generated_at: stamp }
}
