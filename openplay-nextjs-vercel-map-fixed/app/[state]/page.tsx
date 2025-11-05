import { fetchExport } from '@/lib/server'
import { groupBy } from '@/lib/utils'
import VenueCard from '@/components/VenueCard'
import Breadcrumbs from '@/components/Breadcrumbs'
import MapView from '@/components/MapView'

export const revalidate = 300

export default async function StatePage({ params }:{ params: { state: string } }){
  const state = params.state.toUpperCase()
  const { venues } = await fetchExport()
  const inState = venues.filter(v => v.state?.toUpperCase() === state)
  const byCity = groupBy(inState, 'city')
  const cities = Object.keys(byCity).filter(Boolean).sort()

  return (
    <div>
      <header className="site-header">
        <div className="container header-inner">
          <h1>OpenPlay in {state}</h1>
        </div>
      </header>

      <main className="container" style={{padding:'12px 0'}}>
        <Breadcrumbs parts={[{label:'Home', href:'/'}, {label: state}]} />
        <div className="status muted" style={{marginTop:8}}>Filter by day/time and distance in the map below.</div>
        <MapView venues={inState} />

        <section className="main" style={{gridTemplateColumns:'1fr'}}>
          {cities.map(c => (
            <div key={c} style={{marginBottom:24}}>
              <h3>{c}</h3>
              <div className="card-grid">
                {byCity[c].map(v => (
                  <VenueCard key={v.slug} v={v} href={`/${params.state}/${encodeURIComponent(String(c).toLowerCase())}/${v.slug}`} />
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}
