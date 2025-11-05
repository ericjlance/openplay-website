import { fetchExport } from '@/lib/api'
import VenueCard from '@/components/VenueCard'
import Breadcrumbs from '@/components/Breadcrumbs'
import MapView from '@/components/MapView'

export const revalidate = 300

export default async function CityPage({ params }:{ params: { state: string, city: string } }){
  const state = params.state.toUpperCase()
  const city = decodeURIComponent(params.city).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const { venues } = await fetchExport()
  const list = venues.filter(v => v.state?.toUpperCase() === state && (v.city||'').toLowerCase() === city.toLowerCase())

  const center = list.length ? { lat: list[0].lat || 39.74, lng: list[0].lng || -104.99 } : undefined

  return (
    <div>
      <header className="site-header">
        <div className="container header-inner">
          <h1>{city}, {state}</h1>
        </div>
      </header>

      <main className="container" style={{padding:'12px 0'}}>
        <Breadcrumbs parts={[{label:'Home', href:'/'}, {label: state, href:`/${params.state}`}, {label: city}]} />
        <MapView venues={list} initialCenter={center as any} />

        <section className="main" style={{gridTemplateColumns:'1fr'}}>
          <div className="card-grid">
            {list.map(v => (
              <VenueCard key={v.slug} v={v} href={`/${params.state}/${params.city}/${v.slug}`} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
