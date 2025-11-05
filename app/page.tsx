import { fetchExport } from '@/lib/api'

export const revalidate = 300

export default async function Page(){
  const { venues } = await fetchExport()
  const states = Array.from(new Set(venues.map(v=>v.state).filter(Boolean))).sort()

  return (
    <div>
      <header className="site-header">
        <div className="container header-inner">
          <h1>OpenPlay Pickleball</h1>
          <div className="muted small">Nationwide open play directory</div>
        </div>
      </header>

      <main className="container main" style={{gridTemplateColumns:'1fr'}}>
        <section>
          <h2>Browse by State</h2>
          <div className="chip-list" style={{marginTop:12}}>
            {states.map(st => (
              <a key={st} className="chip" href={`/${st.toLowerCase()}`}>{st}</a>
            ))}
          </div>

          <div className="status muted" style={{marginTop:18}}>
            Prefer a map? <a href="/map">Open the map view</a> and filter by day, time, and distance.
          </div>
        </section>
      </main>
    </div>
  )
}
