import { fetchExport } from '@/lib/api'
import MapView from '@/components/MapView'

export const revalidate = 300

export default async function MapPage(){
  const { venues } = await fetchExport()
  return (
    <div>
      <header className="site-header">
        <div className="container header-inner">
          <h1>Find Open Play Near Me</h1>
        </div>
      </header>
      <main>
        <MapView venues={venues} />
      </main>
    </div>
  )
}
