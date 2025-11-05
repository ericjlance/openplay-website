export default function Breadcrumbs({ parts }:{ parts: { label: string, href?: string }[] }){
  return (
    <nav className="small muted" aria-label="Breadcrumb">
      {parts.map((p, i) => (
        <span key={i}>
          {i>0 && ' / '}
          {p.href ? <a href={p.href}>{p.label}</a> : <span>{p.label}</span>}
        </span>
      ))}
    </nav>
  )
}
