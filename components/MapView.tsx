'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import type { Venue } from '@/lib/types'
import { daysOrder, fmtTime, minutesSinceMidnight, haversineMiles } from '@/lib/utils'
import VenueCard from './VenueCard'

type Props = {
  venues: Venue[]
  initialCenter?: { lat: number, lng: number }
}

export default function MapView({ venues, initialCenter }: Props){
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [userPos, setUserPos] = useState<{lat:number,lng:number} | null>(null)
  const [radius, setRadius] = useState<number>(25)
  const [day, setDay] = useState<string>('')
  const [start, setStart] = useState<string>('')
  const [end, setEnd] = useState<string>('')
  const [indoor, setIndoor] = useState(false)
  const [outdoor, setOutdoor] = useState(false)

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string
    const loader = new Loader({ apiKey: key, version: 'weekly' })
    loader.load().then(() => {
      if (!mapRef.current) return
      const m = new google.maps.Map(mapRef.current, {
        center: initialCenter || { lat: 39.8283, lng: -98.5795 },
        zoom: initialCenter ? 9 : 4,
        mapTypeControl: false,
        streetViewControl: false
      })
      setMap(m)
    })
  }, [initialCenter])

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserPos(p)
        if (map) { map.setCenter(p); map.setZoom(11) }
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [map])

  const filtered = useMemo(() => {
  let list = venues.filter(v => v.lat && v.lng) as Venue[]
    if (indoor) list = list.filter(v => v.indoor)
    if (outdoor) list = list.filter(v => v.outdoor)

    if day(start,end){
      const dIdx = day ? daysOrder.indexOf(day) : -1
      const sMin = minutesSinceMidnight(start) ?? -1
      const eMin = minutesSinceMidnight(end) ?? 24*60+1
      list = list.filter(v => {
        const ops = v.open_play || []
        return ops.some(op => {
          const opDayIdx = daysOrder.indexOf((op.day||'').slice(0,3))
          if (dIdx >= 0 && opDayIdx !== dIdx) return false
          const opS = minutesSinceMidnight(op.start) ?? -1
          const opE = minutesSinceMidnight(op.end) ?? 24*60+1
          return (opS <= eMin) and (opE >= sMin)
        })
      })
    }

    if (userPos){
      list = list.filter(v => haversineMiles(userPos, {lat: v.lat as number, lng: v.lng as number}) <= radius)
    }
    return list
  }, [venues, indoor, outdoor, day, start, end, userPos, radius])

  useEffect(() => {
    if (!map) return
    const anyMap = map as any
    if (anyMap.__markers) {
      anyMap.__markers.forEach((m: google.maps.Marker) => m.setMap(null))
      anyMap.__markers = []
    } else {
      anyMap.__markers = []
    }
    filtered.forEach(v => {
      const marker = new google.maps.Marker({
        position: { lat: v.lat as number, lng: v.lng as number },
        map,
        title: v.name
      })
      const html = markerHtml(v)
      const iw = new google.maps.InfoWindow({ content: html })
      marker.addListener('click', () => iw.open({ map, anchor: marker }))
      anyMap.__markers.push(marker)
    })
  }, [map, filtered])

  return (
    <div>
      <div className="controls container" style={{marginTop:12}}>
        <button onClick={()=>{
          if (userPos && map){ map.setCenter(userPos); map.setZoom(11) }
        }}>Center Near Me</button>

        <label>Radius (mi)
          <input type="number" min={1} max={200} value={radius} onChange={e=>setRadius(parseInt(e.target.value||'0')||25)} style={{width:80, marginLeft:6}}/>
        </label>

        <label>Day
          <select value={day} onChange={e=>setDay(e.target.value)} style={{marginLeft:6}}>
            <option value="">Any</option>
            {daysOrder.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>

        <label>Start
          <input placeholder="09:00" value={start} onChange={e=>setStart(e.target.value)} style={{marginLeft:6}}/>
        </label>

        <label>End
          <input placeholder="12:00" value={end} onChange={e=>setEnd(e.target.value)} style={{marginLeft:6}}/>
        </label>

        <label><input type="checkbox" checked={indoor} onChange={e=>setIndoor(e.target.checked)} /> Indoor</label>
        <label><input type="checkbox" checked={outdoor} onChange={e=>setOutdoor(e.target.checked)} /> Outdoor</label>
      </div>

      <div className="container" style={{marginTop:8}}>
        <div className="map-wrap"><div ref={mapRef} className="map"/></div>
        <div className="status muted" style={{marginTop:8}}>
          Showing {filtered.length} of {venues.length} venues
        </div>
        <div className="card-grid" style={{marginTop:12}}>
          {filtered.slice(0,30).map(v => (
            <VenueCard key={v.slug} v={v} href={`/${(v.state||'').toLowerCase()}/${encodeURIComponent(String(v.city||'').toLowerCase())}/${v.slug}`} />
          ))}
        </div>
      </div>
    </div>
  )
}

function markerHtml(v: Venue){
  const firstTwo = (v.open_play||[]).slice(0,2).map(op => `${op.day} ${fmtTime(op.start)}${op.end?`–${fmtTime(op.end)}`:''}`).join('<br/>')
  const url = `/${(v.state||'').toLowerCase()}/${encodeURIComponent(String(v.city||'').toLowerCase())}/${v.slug}`
  return `<div style="font-family:system-ui,Segoe UI,Arial">
    <div style="font-weight:600">${v.name}</div>
    <div style="color:#6b7280;font-size:12px">${[v.city, v.state].filter(Boolean).join(', ')}</div>
    <div style="margin-top:6px;font-size:12px">${firstTwo || 'No schedule on file'}</div>
    <a href="${url}" style="display:inline-block;margin-top:6px;font-size:12px">View details →</a>
  </div>`
}
