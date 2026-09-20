import { Link } from 'react-router-dom'
import { CalendarDays, MapPin, Users, Clock } from 'lucide-react'
import { domains } from '../data/mockData'
import { daysLeft, formatRange, toneForDomain } from '../utils'
import { Tag, SkillTags } from './ui'

export default function HackathonCard({ hackathon: h }) {
  const tone = toneForDomain(h.domain)
  const domain = domains.find((d) => d.id === h.domain)
  const left = daysLeft(h.deadline)

  return (
    <Link to={`/hackathons/${h.id}`} className="card group flex h-full flex-col p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <Tag tone={tone}>{domain?.name}</Tag>
        <Tag tone={{ bg: 'bg-line', text: 'text-ink-soft' }}>{h.mode}</Tag>
      </div>
      <h3 className="mt-4 text-lg font-semibold leading-snug group-hover:text-lilac-700">{h.title}</h3>
      <p className="mt-0.5 text-sm text-ink-soft">by {h.organizer}</p>

      <dl className="mt-4 space-y-2 text-sm text-ink-soft">
        <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 shrink-0" />{formatRange(h.startDate, h.endDate)}</div>
        <div className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" />{h.location}</div>
        <div className="flex items-center gap-2"><Users className="h-4 w-4 shrink-0" />Teams of {h.teamSizeMin}–{h.teamSizeMax}</div>
      </dl>

      <div className="mt-4"><SkillTags skills={h.requiredSkills} max={3} /></div>

      <div className="mt-auto flex items-center justify-between border-t border-line pt-4 mt-5 text-sm">
        <span className="flex items-center gap-1.5 text-ink-soft">
          <Clock className="h-4 w-4" />
          {left > 0 ? `${left} day${left === 1 ? '' : 's'} left to apply` : 'Applications closed'}
        </span>
      </div>
    </Link>
  )
}
