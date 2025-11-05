'use client'
import { Venue } from '@/lib/types'
import { fmtTime } from '@/lib/utils'

export default function VenueCard({ v, href }:{ v: Venue, href?: string }){
  const content = (
    <div className="card">
      <div className="title">{v.name}</div>
      <div className="sub">{[v.city, v.state].filter(Boolean).join(', ')}</div>
      <div className="tag-row">
        {v.indoor && <span className="tag">Indoor</span>}
        {v.outdoor && <span className="tag">Outdoor</span>}
        {v.stale && <span className="tag">Stale</span>}
      </div>
      <div className="schedule">
        {(v.open_play && v.open_play.length>0) ? (
          <>
            {v.open_play.slice(0,2).map((op, i) => (
              <div key={i} className="schedule-row">
                <span>{op.day}</span>&nbsp;
                <span className="tabular-nums">{fmtTime(op.start)}{op.end?`–${fmtTime(op.end)}`:''}</span>
                {op.notes && <span className="sub">&nbsp;· {op.notes}</span>}
              </div>
            ))}
            {v.open_play.length>2 && <div className="sub">+{v.open_play.length-2} more</div>}
          </>
        ) : <div className="sub">No schedule on file</div>}
      </div>
    </div>
  )

  if (href) return <a className="no-underline" href={href}>{content}</a>
  return content
}
