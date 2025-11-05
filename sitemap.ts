import { MetadataRoute } from 'next'
import { fetchExport } from '@/lib/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://example.com'
  const items: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'hourly', priority: 1 },
    { url: `${base}/map`, changeFrequency: 'hourly', priority: 0.9 }
  ]

  const { venues } = await fetchExport()
  const states = Array.from(new Set(venues.map(v=>v.state).filter(Boolean))) as string[]
  for (const st of states) {
    items.push({ url: `${base}/${st.toLowerCase()}`, changeFrequency: 'hourly', priority: 0.8 })
    const cities = Array.from(new Set(venues.filter(v=>v.state===st).map(v=>v.city).filter(Boolean))) as string[]
    for (const c of cities) {
      const citySlug = String(c).toLowerCase()
      items.push({ url: `${base}/${st.toLowerCase()}/${encodeURIComponent(citySlug)}`, changeFrequency: 'hourly', priority: 0.7 })
      const inCity = venues.filter(v=>v.state===st && v.city===c)
      for (const v of inCity) {
        items.push({ url: `${base}/${st.toLowerCase()}/${encodeURIComponent(citySlug)}/${v.slug}`, changeFrequency: 'hourly', priority: 0.6 })
      }
    }
  }
  return items
}
