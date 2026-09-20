import { CalendarDays, MapPin, Users, Clock, ArrowUpRight } from 'lucide-react'
import { domains } from '../data/mockData'
import { daysLeft, formatRange } from '../utils'

// Dark-theme content for a hackathon inside a MagicBento card.
// MagicBento supplies the card shell (link, glow, tilt, particles); this is only what goes inside.
export default function HackathonBentoCard({ hackathon: h, wide = false }) {
  const domain = domains.find((d) => d.id === h.domain)
  const left = daysLeft(h.deadline)
  const maxSkills = wide ? 5 : 3

  return (
    <div className="bento-hackathon">
      <div className="bento-hackathon__top">
        <span className="bento-tag bento-tag--accent">{domain?.name}</span>
        <span className="bento-tag">{h.mode}</span>
      </div>

      <h3 className="bento-hackathon__title">{h.title}</h3>
      <p className="bento-hackathon__by">by {h.organizer}</p>

      <dl className="bento-hackathon__meta">
        <div><CalendarDays />{formatRange(h.startDate, h.endDate)}</div>
        <div><MapPin />{h.location}</div>
        <div><Users />Teams of {h.teamSizeMin}–{h.teamSizeMax}</div>
      </dl>

      {wide && h.prize && <p className="bento-hackathon__prize">{h.prize}</p>}

      <div className="bento-hackathon__skills">
        {h.requiredSkills.slice(0, maxSkills).map((s) => <span key={s} className="bento-tag">{s}</span>)}
        {h.requiredSkills.length > maxSkills && <span className="bento-tag">+{h.requiredSkills.length - maxSkills}</span>}
      </div>

      <div className="bento-hackathon__rule" />
      <div className="bento-hackathon__foot">
        <span className="bento-hackathon__foot-inner">
          <Clock />
          {left > 0 ? `${left} day${left === 1 ? '' : 's'} left to apply` : 'Applications closed'}
        </span>
        <ArrowUpRight />
      </div>
    </div>
  )
}
