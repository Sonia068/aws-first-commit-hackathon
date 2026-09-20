import { Link, useParams } from 'react-router-dom'
import { CalendarDays, MapPin, Users, Trophy, ExternalLink, CheckCircle2, Clock, GraduationCap } from 'lucide-react'
import { useAsync } from '../hooks'
import { getHackathon, getTeams } from '../services/api'
import { domains } from '../data/mockData'
import { BackLink, Spinner, EmptyState, Tag, SkillTags, ProgressBar } from '../components/ui'
import { daysLeft, formatDate, formatRange, toneForDomain } from '../utils'

function Fact({ icon: Icon, label, children, tone }) {
  return (
    <div className={`rounded-2xl p-4 ${tone}`}>
      <Icon className="h-5 w-5 text-ink-soft" />
      <p className="mt-3 text-xs text-ink-soft">{label}</p>
      <p className="mt-0.5 font-medium">{children}</p>
    </div>
  )
}

export default function HackathonDetail() {
  const { id } = useParams()
  const { data: h, loading } = useAsync(() => getHackathon(id), [id])
  const { data: teams } = useAsync(getTeams)

  if (loading) return <Spinner />
  if (!h) return <div className="container-page py-16"><EmptyState title="Hackathon not found" action={<Link to="/hackathons" className="btn-primary">Back to hackathons</Link>} /></div>

  const tone = toneForDomain(h.domain)
  const domain = domains.find((d) => d.id === h.domain)
  const left = daysLeft(h.deadline)
  const related = (teams || []).filter((t) => t.hackathonId === h.id)

  return (
    <div className="container-page py-10">
      <BackLink to="/hackathons">All hackathons</BackLink>

      <div className={`rounded-3xl p-8 sm:p-10 ${tone.soft}`}>
        <div className="flex flex-wrap gap-2">
          <Tag tone={tone}>{domain?.name}</Tag>
          <Tag tone={{ bg: 'bg-white', text: 'text-ink-soft' }}>{h.mode}</Tag>
        </div>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">{h.title}</h1>
        <p className="mt-1 text-ink-soft">Hosted by <Link to={`/companies/${h.companyId}`} className="font-medium text-ink hover:underline">{h.organizer}</Link></p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a href={h.officialUrl} target="_blank" rel="noreferrer" className="btn-primary">Apply on official site <ExternalLink className="h-4 w-4" /></a>
          <Link to={`/teams/new?hackathon=${h.id}`} className="btn-outline">Create a team for this</Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Fact icon={CalendarDays} label="Event dates" tone="bg-sky-50">{formatRange(h.startDate, h.endDate)}</Fact>
        <Fact icon={Clock} label="Apply by" tone="bg-peach-50">{formatDate(h.deadline)} {left > 0 && <span className="text-sm text-ink-soft">({left}d left)</span>}</Fact>
        <Fact icon={MapPin} label="Location" tone="bg-mint-50">{h.location}</Fact>
        <Fact icon={Users} label="Team size" tone="bg-butter-50">{h.teamSizeMin}–{h.teamSizeMax} people</Fact>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-semibold">About</h2>
            <p className="mt-2 max-w-2xl leading-relaxed text-ink-soft">{h.about}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Requirements</h2>
            <ul className="mt-3 space-y-2">
              {h.requirements.map((r) => (
                <li key={r} className="flex items-start gap-2 text-ink-soft"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-mint-500" />{r}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Skills teams will need</h2>
            <div className="mt-3"><SkillTags skills={h.requiredSkills} /></div>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Teams forming</h2>
            {related.length === 0 ? (
              <p className="mt-2 text-ink-soft">No teams yet. <Link to={`/teams/new?hackathon=${h.id}`} className="font-medium text-lilac-700 hover:underline">Start the first one.</Link></p>
            ) : (
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {related.map((t) => (
                  <Link key={t.id} to={`/teams/${t.id}`} className="card p-4 hover:shadow-md">
                    <p className="font-display font-semibold">{t.name}</p>
                    <p className="mt-1 text-sm text-ink-soft">{t.memberIds.length}/{t.maxSize} members</p>
                    <div className="mt-3"><ProgressBar percent={t.percent} /></div>
                    <p className="mt-1 text-xs text-ink-soft">{t.percent}% of skills covered</p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-butter-50 p-5">
            <Trophy className="h-5 w-5 text-butter-700" />
            <p className="mt-3 text-xs text-ink-soft">Prize</p>
            <p className="font-display text-lg font-semibold">{h.prize}</p>
          </div>
          <div className="rounded-2xl bg-lilac-50 p-5">
            <GraduationCap className="h-5 w-5 text-lilac-700" />
            <p className="mt-3 text-xs text-ink-soft">Eligibility</p>
            <p className="font-medium">{h.eligibility}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
