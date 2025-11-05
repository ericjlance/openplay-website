import type { Venue } from './types'

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

export function groupBy<T extends Record<string, any>>(arr: T[], key: keyof T){
  return arr.reduce((acc: Record<string, T[]>, item) => {
    const k = (item[key] ?? '') as string
    if (!acc[k]) acc[k] = []
    acc[k].push(item)
    return acc
  }, {})
}
