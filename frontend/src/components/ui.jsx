import { Link } from 'react-router-dom'
import { Loader2, SearchX } from 'lucide-react'
import { initials, tones, toneByIndex } from '../utils'

export function Spinner({ label = 'Loading' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-20 text-ink-soft" role="status">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">{label}…</span>
    </div>
  )
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-lilac-100 text-lilac-700">
        <SearchX className="h-6 w-6" />
      </span>
      <h3 className="text-lg font-semibold">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-ink-soft">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Tag({ children, tone = tones.lilac, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tone.bg} ${tone.text} ${className}`}>
      {children}
    </span>
  )
}

export function SkillTags({ skills = [], highlight = [], max }) {
  const list = max ? skills.slice(0, max) : skills
  return (
    <div className="flex flex-wrap gap-1.5">
      {list.map((s) => (
        <Tag key={s} tone={highlight.includes(s) ? tones.mint : tones.lilac}>
          {s}
        </Tag>
      ))}
      {max && skills.length > max && (
        <Tag tone={{ bg: 'bg-line', text: 'text-ink-soft' }}>+{skills.length - max}</Tag>
      )}
    </div>
  )
}

export function Avatar({ name, index = 0, size = 'md' }) {
  const t = toneByIndex(index)
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-16 w-16 text-xl' }
  return (
    <span className={`grid shrink-0 place-items-center rounded-full font-semibold ${sizes[size]} ${t.bg} ${t.text}`}>
      {initials(name)}
    </span>
  )
}

export function ProgressBar({ percent, tone = tones.mint }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${percent}%` }} />
    </div>
  )
}

export function PageHeader({ title, subtitle, children, tone = 'bg-lilac-50' }) {
  return (
    <section className={`border-b border-line ${tone}`}>
      <div className="container-page flex flex-col gap-4 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 max-w-xl text-ink-soft">{subtitle}</p>}
        </div>
        {children}
      </div>
    </section>
  )
}

export function BackLink({ to, children }) {
  return (
    <Link to={to} className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-lilac-700">
      ← {children}
    </Link>
  )
}
