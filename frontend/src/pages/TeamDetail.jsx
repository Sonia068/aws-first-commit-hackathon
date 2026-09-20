import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, UserPlus } from 'lucide-react'
import { useAsync } from '../hooks'
import { getTeam, getStudents, getRecommendedTeammates } from '../services/api'
import { hackathons } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import { BackLink, Spinner, EmptyState, Tag, SkillTags, ProgressBar, Avatar } from '../components/ui'
import { tones } from '../utils'

export default function TeamDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { data: team, loading } = useAsync(() => getTeam(id), [id])
  const { data: students } = useAsync(getStudents)
  const { data: recs } = useAsync(
    () => (team ? getRecommendedTeammates({ requiredSkills: team.requiredSkills, excludeIds: team.memberIds }) : Promise.resolve([])),
    [team?.id]
  )
  const [invited, setInvited] = useState([])
  const [requested, setRequested] = useState(false)

  if (loading) return <Spinner />
  if (!team) return <div className="container-page py-16"><EmptyState title="Team not found" action={<Link to="/teams" className="btn-primary">All teams</Link>} /></div>

  const h = hackathons.find((x) => x.id === team.hackathonId)
  const members = team.memberIds.map((mid) => (students || []).find((s) => s.id === mid) || (user?.id === mid ? { id: mid, name: user.name, role: 'Team lead', skills: [], university: user.university } : null)).filter(Boolean)
  const full = team.memberIds.length >= team.maxSize
  const isMember = user && team.memberIds.includes(user.id)

  return (
    <div className="container-page py-10">
      <BackLink to="/teams">All teams</BackLink>

      <div className="rounded-3xl bg-peach-50 p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone={tones.mint}>{full ? 'Full' : team.status}</Tag>
          <span className="text-sm text-ink-soft">{team.memberIds.length}/{team.maxSize} members</span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold">{team.name}</h1>
        {h && <p className="mt-1 text-ink-soft">Entering <Link to={`/hackathons/${h.id}`} className="font-medium text-ink hover:underline">{h.title}</Link></p>}
        <p className="mt-3 max-w-2xl text-ink-soft">{team.description}</p>
        <div className="mt-5">
          {isMember ? <span className="btn-soft cursor-default"><Check className="h-4 w-4" /> You're on this team</span>
            : requested ? <span className="btn-soft cursor-default"><Check className="h-4 w-4" /> Request sent</span>
            : <button className="btn-primary" disabled={full} onClick={() => setRequested(true)}>{full ? 'Team is full' : 'Request to join'}</button>}
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-semibold">Members</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {members.map((m, i) => (
                <Link key={m.id} to={`/students/${m.id}`} className="card flex items-center gap-3 p-4 hover:shadow-md">
                  <Avatar name={m.name} index={i} />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{m.name}</p>
                    <p className="truncate text-sm text-ink-soft">{m.role}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Recommended teammates</h2>
            <p className="mt-1 text-sm text-ink-soft">Ranked by how many of the team's required skills they have.</p>
            <div className="mt-4 space-y-3">
              {(recs || []).slice(0, 5).map((s, i) => {
                const gaps = s.matched.filter((sk) => team.missing.includes(sk))
                return (
                  <div key={s.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                    <div className="flex flex-1 items-center gap-3">
                      <Avatar name={s.name} index={i + 2} />
                      <div className="min-w-0">
                        <Link to={`/students/${s.id}`} className="font-medium hover:underline">{s.name}</Link>
                        <p className="text-sm text-ink-soft">{s.role} · {s.university}</p>
                        <div className="mt-2"><SkillTags skills={s.skills} highlight={team.missing} /></div>
                        {gaps.length > 0 && <p className="mt-2 text-xs text-mint-700">Fills: {gaps.join(', ')}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
                      <div className="w-24">
                        <p className="mb-1 text-right text-xs font-medium">{s.percent}% match</p>
                        <ProgressBar percent={s.percent} />
                      </div>
                      <button
                        className={invited.includes(s.id) ? 'btn-soft' : 'btn-outline'}
                        disabled={invited.includes(s.id) || full}
                        onClick={() => setInvited((l) => [...l, s.id])}
                      >
                        {invited.includes(s.id) ? <><Check className="h-4 w-4" /> Invited</> : <><UserPlus className="h-4 w-4" /> Invite</>}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-mint-50 p-5">
            <div className="flex justify-between text-sm"><span className="font-medium">Team completion</span><span>{team.percent}%</span></div>
            <div className="mt-2"><ProgressBar percent={team.percent} /></div>
          </div>
          <div className="rounded-2xl bg-lilac-50 p-5">
            <p className="font-medium">Skills needed</p>
            <div className="mt-3"><SkillTags skills={team.requiredSkills} highlight={team.requiredSkills.filter((s) => !team.missing.includes(s))} /></div>
            <p className="mt-2 text-xs text-ink-soft">Green skills are already covered.</p>
          </div>
          <div className="rounded-2xl bg-rose-50 p-5">
            <p className="font-medium">Still missing</p>
            <div className="mt-3">
              {team.missing.length ? <SkillTags skills={team.missing} /> : <p className="text-sm text-ink-soft">Every required skill is covered.</p>}
            </div>
          </div>
          {team.preferredRoles?.length > 0 && (
            <div className="rounded-2xl bg-sky-50 p-5">
              <p className="font-medium">Preferred roles</p>
              <div className="mt-3 flex flex-wrap gap-1.5">{team.preferredRoles.map((r) => <Tag key={r} tone={tones.sky}>{r}</Tag>)}</div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
