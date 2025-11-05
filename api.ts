import 'server-only'
import { Venue, ExportResponse } from './types'

const envUrl = process.env.EXPORT_URL
const fallback = process.env.FALLBACK_EXPORT_URL || 'https://openplay.replit.app/api/export'

function heal(url?: string | null){
  if (!url) return fallback
  return url.replace('openplauy', 'openplay')
}

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

export function groupBy<T extends Record<string, any>>(arr: T[], key: keyof T){
  return arr.reduce((acc: Record<string, T[]>, item) => {
    const k = (item[key] ?? '') as string
    if (!acc[k]) acc[k] = []
    acc[k].push(item)
    return acc
  }, {})
}

export const daysOrder = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export function slugify(s: string){
  return s.toLowerCase()
    // @ts-ignore
    .normalize('NFD').replace(/\p{Diacritic}/gu,'')
    .replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)+/g,'')
}

export function fmtTime(t?: string){
  if (!t) return ''
  const m = /^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/i.exec(t.trim())
  if (!m) return t
  let [, hh, mm, ap] = m
  let H = parseInt(hh, 10)
  if (ap){
    const isPM = ap.toUpperCase() === 'PM'
    if (H === 12) H = isPM ? 12 : 0; else H = isPM ? H + 12 : H
  }
  return `${String(H).padStart(2,'0')}:${mm}`
}

export function minutesSinceMidnight(t?: string){
  if (!t) return null
  const m = /^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/i.exec(t.trim())
  if (!m) return null
  let [, hh, mm, ap] = m as any
  let H = parseInt(hh, 10)
  const M = parseInt(mm, 10)
  if (ap){
    const isPM = ap.toUpperCase() === 'PM'
    if (H === 12) H = isPM ? 12 : 0; else H = isPM ? H + 12 : H
  }
  return H*60 + M
}

export function haversineMiles(a:{lat:number,lng:number}, b:{lat:number,lng:number}){
  const toRad = (x:number)=>x*Math.PI/180
  const R = 3958.8
  const dLat = toRad(b.lat-a.lat)
  const dLng = toRad(b.lng-a.lng)
  const lat1 = toRad(a.lat), lat2 = toRad(b.lat)
  const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2
  return 2*R*Math.asin(minMax(Math.sqrt(h),0,1))
}
function minMax(v:number,min:number,max:number){ return Math.max(min, Math.min(max, v)) }
