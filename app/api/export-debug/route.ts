import { SITE_CONFIG } from '@/lib/config'

export const revalidate = 0

export async function GET() {
  const url = SITE_CONFIG.exportUrl
  try {
    const r = await fetch(url, { headers: { 'Accept': 'application/json' } })
    const text = await r.text()
    return new Response(text, {
      status: r.status,
      headers: { 'content-type': r.headers.get('content-type') || 'application/json' }
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e), exportUrl: url }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
}
