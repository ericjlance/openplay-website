import type { Metadata } from 'next'
import { fetchExport, fmtTime } from '@/lib/api'
import Breadcrumbs from '@/components/Breadcrumbs'

export const revalidate = 300

type Props = { params: { state: string, city: string, slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { venues } = await fetchExport()
  const v = venues.find(x => x.slug === params.slug)
  const title = v ? `Open Play at ${v.name} – ${v.city}, ${v.state}` : 'Open Play Pickleball'
  const description = v?.address || 'Find open play / drop-in pickleball near you.'
  return { title, description }
}

export default async function VenuePage({ params }: Props){
  const { venues } = await fetchExport()
  const v = venues.find(x => x.slug === params.slug)
  const state = params.state.toUpperCase()
  const city = decodeURIComponent(params.city).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  if (!v) {
    return (
      <main className="container" style={{padding:'24px 0'}}>
        <Breadcrumbs parts={[{label:'Home', href:'/'}, {label: state, href:`/${params.state}`}, {label: city, href:`/${params.state}/${params.city}`}, {label:'Not found'}]} />
        <h1>Venue not found</h1>
        <p className="muted">This venue may have been removed or renamed.</p>
      </main>
    )
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    "name": v.name,
    "address": v.address ? {
      "@type": "PostalAddress",
      "streetAddress": v.address,
      "addressLocality": v.city,
      "addressRegion": v.state,
      "addressCountry": "US"
    } : undefined,
    "geo": (v.lat && v.lng) ? {
      "@type": "GeoCoordinates",
      "latitude": v.lat,
      "longitude": v.lng
    } : undefined,
    "telephone": v.phone || undefined,
    "event": (v.open_play||[]).length ? {
      "@type": "Event",
      "name": "Open Play Pickleball",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "eventStatus": "https://schema.org/EventScheduled",
      "eventSchedule": (v.open_play||[]).map(op => ({
        "@type":"Schedule",
        "byDay": `https://schema.org/${normalizeDay(op.day)}`,
        "startTime": op.start || undefined,
        "endTime": op.end || undefined
      }))
    } : undefined
  }

  return (
    <div>
      <header className="site-header">
        <div className="container header-inner">
          <h1>{v.name}</h1>
        </div>
      </header>

      <main className="container" style={{padding:'16px 0'}}>
        <Breadcrumbs parts={[{label:'Home', href:'/'}, {label: state, href:`/${params.state}`}, {label: city, href:`/${params.state}/${params.city}`}, {label:v.name}]} />

        <div style={{marginTop:12}} className="muted">{v.address}</div>
        <div className="tag-row">
          {v.indoor && <span className="tag">Indoor</span>}
          {v.outdoor && <span className="tag">Outdoor</span>}
          {v.stale && <span className="tag">Check before you go</span>}
        </div>

        <section style={{marginTop:16}}>
          <h3>Open Play Schedule</h3>
          {(v.open_play && v.open_play.length) ? (
            <ul style={{paddingLeft:0,listStyle:'none'}}>
              {v.open_play.slice().sort((a:any,b:any)=>dayIndex(a.day)-dayIndex(b.day) || String(a.start||'').localeCompare(String(b.start||''))).map((op:any, i:number)=>(
                <li key={i} className="schedule-row">
                  <span style={{width:48,display:'inline-block'}}>{op.day}</span>
                  <span className="tabular-nums">{fmtTime(op.start)}{op.end?`–${fmtTime(op.end)}`:''}</span>
                  {op.notes && <span className="sub">&nbsp;· {op.notes}</span>}
                </li>
              ))}
            </ul>
          ) : <div className="sub">No schedule on file.</div>}
        </section>

        <section className="small muted" style={{marginTop:12,display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          {v.phone && <div><div>Phone</div><a href={`tel:${v.phone}`}>{v.phone}</a></div>}
          {v.website && <div><div>Website</div><a href={v.website} target="_blank" rel="noreferrer">{v.website}</a></div>}
          {v.cost && <div><div>Cost</div><div>{v.cost}</div></div>}
          {v.last_verified_at && <div><div>Last verified</div><div>{new Date(v.last_verified_at).toLocaleString()}</div></div>}
        </section>

        {(v.photos||[]).length>0 && (
          <section style={{marginTop:12, display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {v.photos!.slice(0,4).map((p, i)=>(<img key={i} src={p} alt="Venue" style={{width:'100%',height:140,objectFit:'cover',borderRadius:10,border:'1px solid var(--border)'}}/>))}
          </section>
        )}

        <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      </main>
    </div>
  )
}

function normalizeDay(d?: string){
  const map: Record<string,string> = { Sun:'Sunday', Mon:'Monday', Tue:'Tuesday', Wed:'Wednesday', Thu:'Thursday', Fri:'Friday', Sat:'Saturday' }
  const k = (d||'').slice(0,3)
  return map[k] || 'Monday'
}

function dayIndex(d?: string){
  const order = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const k = (d||'').slice(0,3)
  return Math.max(0, order.indexOf(k))
}
