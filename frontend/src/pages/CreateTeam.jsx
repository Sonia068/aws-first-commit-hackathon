import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { createTeam } from '../services/api'
import { hackathons, allSkills } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import { BackLink } from '../components/ui'

export default function CreateTeam() {
  const { user } = useAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    hackathonId: params.get('hackathon') || '',
    description: '',
    maxSize: 4,
    preferredRoles: '',
  })
  const [skills, setSkills] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const toggle = (s) => setSkills((l) => (l.includes(s) ? l.filter((x) => x !== s) : [...l, s]))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.hackathonId) return setError('Add a team name and choose a hackathon.')
    if (skills.length === 0) return setError('Pick at least one skill your team needs.')
    setError('')
    setSaving(true)
    const team = await createTeam({
      name: form.name.trim(),
      hackathonId: form.hackathonId,
      description: form.description.trim(),
      requiredSkills: skills,
      preferredRoles: form.preferredRoles.split(',').map((r) => r.trim()).filter(Boolean),
      maxSize: Number(form.maxSize),
      memberIds: [user.id],
    })
    navigate(`/teams/${team.id}`)
  }

  return (
    <div className="container-page max-w-2xl py-10">
      <BackLink to="/teams">All teams</BackLink>
      <h1 className="text-3xl font-semibold">Create a team</h1>
      <p className="mt-2 text-ink-soft">Tell people what you're building and which skills you still need.</p>

      <form onSubmit={submit} className="card mt-8 space-y-5 p-6">
        <div>
          <label className="label" htmlFor="name">Team name</label>
          <input id="name" className="input" value={form.name} onChange={update('name')} placeholder="e.g. Team Aurora" />
        </div>
        <div>
          <label className="label" htmlFor="hack">Hackathon</label>
          <select id="hack" className="input" value={form.hackathonId} onChange={update('hackathonId')}>
            <option value="">Choose a hackathon</option>
            {hackathons.map((h) => <option key={h.id} value={h.id}>{h.title}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="desc">What are you building?</label>
          <textarea id="desc" rows={3} className="input" value={form.description} onChange={update('description')} placeholder="One or two sentences" />
        </div>
        <fieldset>
          <legend className="label">Skills your team needs</legend>
          <div className="flex flex-wrap gap-2">
            {allSkills.map((s) => (
              <button type="button" key={s} onClick={() => toggle(s)} aria-pressed={skills.includes(s)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${skills.includes(s) ? 'bg-lilac-500 text-white' : 'bg-lilac-50 text-lilac-700 hover:bg-lilac-100'}`}>
                {s}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="roles">Preferred roles</label>
            <input id="roles" className="input" value={form.preferredRoles} onChange={update('preferredRoles')} placeholder="ML Engineer, Designer" />
          </div>
          <div>
            <label className="label" htmlFor="size">Max team size</label>
            <select id="size" className="input" value={form.maxSize} onChange={update('maxSize')}>
              {[2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}
            </select>
          </div>
        </div>
        {error && <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700" role="alert">{error}</p>}
        <button className="btn-primary w-full" disabled={saving}>{saving ? 'Creating…' : 'Create team'}</button>
      </form>
    </div>
  )
}
