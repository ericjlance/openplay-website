export type OpenPlay = { day?: string; start?: string; end?: string; notes?: string }
export type Venue = {
  slug: string
  name: string
  address?: string
  city?: string
  state?: string
  lat?: number | null
  lng?: number | null
  indoor?: boolean
  outdoor?: boolean
  cost?: string
  phone?: string
  website?: string
  status?: string
  amenities?: string[]
  open_play?: OpenPlay[]
  rating?: number | null
  reviews_ct?: number | null
  last_verified_at?: string | null
  stale?: boolean
  confidence?: number | null
  photos?: string[]
  source?: string
}
export type ExportResponse = Venue[] | { venues: Venue[], export_generated_at?: string }
