import 'server-only'
import { SITE_CONFIG } from '@/lib/config'
import { slugify } from '@/lib/utils'
import type { Venue, ExportResponse } from '@/lib/types'

function coerceNumber(value: unknown): number | null {
  if (value == null) return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function coerceVenues(data: ExportResponse): { list: any[]; stamp?: string } {
  if (!data) return { list: [], stamp: undefined }

  const candidates: unknown[] = []

  if (Array.isArray(data)) {
    candidates.push(data)
  } else {
    const maybeRecord = data as Record<string, unknown>
    const possibleKeys = [
      'venues',
      'data',
      'results',
      'payload',
      'items'
    ]

    for (const key of possibleKeys) {
      const value = maybeRecord[key]
      if (Array.isArray(value)) {
        candidates.push(value)
        break
      }
      if (value && typeof value === 'object') {
        const inner = value as Record<string, unknown>
        for (const innerKey of possibleKeys) {
          const innerValue = inner[innerKey]
          if (Array.isArray(innerValue)) {
            candidates.push(innerValue)
            break
          }
        }
        if (candidates.length) break
      }
    }

    if (!candidates.length) {
      const values = Object.values(maybeRecord)
      const firstArray = values.find((value): value is unknown[] => Array.isArray(value))
      if (firstArray) {
        candidates.push(firstArray)
      }
    }
  }

  const stamp = !Array.isArray(data)
    ? ((data as any).export_generated_at || (data as any).meta?.export_generated_at)
    : undefined

  return { list: (candidates[0] as any[]) || [], stamp }
}

function coerceOpenPlay(value: unknown): Venue['open_play'] {
  if (Array.isArray(value)) return value as Venue['open_play']
  return []
}

export async function fetchExport(): Promise<{ venues: Venue[], export_generated_at?: string }> {
  const url = SITE_CONFIG.exportUrl
  const res = await fetch(url, { next: { revalidate: 300 }, headers: { 'Accept': 'application/json' } })
  if (!res.ok) throw new Error(`Export fetch failed: ${res.status}`)
  const data: ExportResponse = await res.json()
  const { list, stamp } = coerceVenues(data)

  const venues: Venue[] = list.map((v: any) => {
    const lat = coerceNumber(v.lat ?? v.latitude)
    const lng = coerceNumber(v.lng ?? v.lon ?? v.long ?? v.longitude)

    return {
      slug: v.slug || slugify(v.name || ''),
      name: v.name || 'Unknown Venue',
      address: v.address || '',
      city: v.city || '',
      state: v.state || '',
      lat,
      lng,
      indoor: !!v.indoor,
      outdoor: !!v.outdoor,
      cost: v.cost || v.price || '',
      phone: v.phone || '',
      website: v.website || v.url || '',
      status: v.status || '',
      amenities: Array.isArray(v.amenities) ? v.amenities : [],
      open_play: coerceOpenPlay(v.open_play),
      rating: coerceNumber(v.rating),
      reviews_ct: coerceNumber(v.reviews_ct ?? v.review_count) ?? null,
      last_verified_at: v.last_verified_at || v.updated_at || stamp || null,
      stale: !!v.stale,
      confidence: coerceNumber(v.confidence),
      photos: Array.isArray(v.photos) ? v.photos : [],
      source: v.source || ''
    }
  })

  return { venues, export_generated_at: stamp }
}
