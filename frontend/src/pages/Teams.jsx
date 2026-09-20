import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'
import { useAsync } from '../hooks'
import { getTeams, getStudents } from '../services/api'
import { hackathons } from '../data/mockData'
import { PageHeader, Spinner, EmptyState, Tag, SkillTags, ProgressBar, Avatar } from '../components/ui'
import { tones } from '../utils'

export default function Teams() {
  const { data: teams, loading } = useAsync(getTeams)
  const { data: students } = useAsync(getStudents)
  const [hackathonId, setHackathonId] = useState('')
  const shown = (teams || []).filter((t) => !hackathonId || t.hackathonId === hackathonId)

  return (
    <>
      <PageHeader title="Teams" subtitle="Join a team that needs your skills, or start your own." tone="bg-peach-50">
        <Link to="/teams/new" className="btn-primary"><Plus className="h-4 w-4" /> Create a team</Link>
      </PageHeader>
      <div className="container-page mt-8">
        <div className="mb-6 max-w-xs">
          <label className="label" htmlFor="hf">Hackathon</label>
          <select id="hf" className="input" value={hackathonId} onChange={(e) => setHackathonId(e.target.value)}>
            <option value="">All hackathons</option>
            {hackathons.map((h) => <option key={h.id} value={h.id}>{h.title}</option>)}
          </select>
        </div>

        {loading ? <Spinner /> : shown.length === 0 ? (
          <EmptyState title="No teams for this hackathon yet" message="Be the first to start one." action={<Link to={`/teams/new${hackathonId ? `?hackathon=${hackathonId}` : ''}`} className="btn-primary">Create a team</Link>} />
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {shown.map((t) => {
              const h = hackathons.find((x) => x.id === t.hackathonId)
              const members = (students || []).filter((s) => t.memberIds.includes(s.id))
              return (
                <Link key={t.id} to={`/teams/${t.id}`} className="card p-6 transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold">{t.name}</h2>
                      <p className="text-sm text-ink-soft">{h?.title}</p>
                    </div>
                    <Tag tone={tones.mint}>{t.status}</Tag>
                  </div>
                  <p className="mt-3 text-sm text-ink-soft">{t.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {members.map((m, i) => <span key={m.id} className="rounded-full ring-2 ring-white"><Avatar name={m.name} index={i} size="sm" /></span>)}
                    </div>
                    <span className="flex items-center gap-1.5 text-sm text-ink-soft"><Users className="h-4 w-4" />{t.memberIds.length}/{t.maxSize}</span>
                  </div>
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-xs text-ink-soft"><span>Skills covered</span><span>{t.percent}%</span></div>
                    <ProgressBar percent={t.percent} />
                  </div>
                  {t.missing.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-1.5 text-xs text-ink-soft">Looking for</p>
                      <SkillTags skills={t.missing} />
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
