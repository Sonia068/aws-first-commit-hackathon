import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { useAsync } from '../hooks'
import { getProfile, updateProfile, getTeams } from '../services/api'
import { hackathons } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import { Avatar, Spinner, EmptyState, SkillTags, Tag, BackLink } from '../components/ui'
import { tones } from '../utils'

export default function Profile() {
  const { id: paramId } = useParams()
  const { user } = useAuth()
  const id = paramId || user?.id
  const own = !!user && id === user.id
  const { data: fetched, loading } = useAsync(() => getProfile(id), [id])
  const { data: teams } = useAsync(getTeams)
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (loading) return
    if (fetched) setProfile(fetched)
    else if (own) setProfile({ id, name: user.name, university: user.university, bio: '', skills: [], role: '', availability: '', hackathons: [], teams: [] })
    else setProfile(null)
  }, [fetched, loading, own, id, user])

  if (loading || (fetched === null && own && !profile)) return <Spinner />
  if (!profile) return <div className="container-page py-16"><EmptyState title="Profile not found" action={<Link to="/teams" className="btn-primary">Back to teams</Link>} /></div>

  const name = profile.name || user?.name
  const startEdit = () => {
    setForm({ bio: profile.bio || '', role: profile.role || '', availability: profile.availability || '', skills: (profile.skills || []).join(', ') })
    setEditing(true)
  }
  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    const updated = await updateProfile(id, {
      name, university: profile.university,
      bio: form.bio, role: form.role, availability: form.availability,
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
    })
    setProfile(updated)
    setSaving(false)
    setEditing(false)
  }

  const myTeams = (teams || []).filter((t) => t.memberIds.includes(id))
  const myHacks = hackathons.filter((h) => (profile.hackathons || []).includes(h.id))

  return (
    <div className="container-page max-w-4xl py-10">
      {paramId && <BackLink to="/teams">Teams</BackLink>}
      <div className="rounded-3xl bg-lilac-50 p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar name={name} size="lg" index={2} />
          <div className="flex-1">
            <h1 className="text-3xl font-semibold">{name}</h1>
            <p className="text-ink-soft">{[profile.role, profile.university].filter(Boolean).join(' · ')}</p>
            {profile.availability && <Tag tone={tones.mint} className="mt-2">Available {profile.availability.toLowerCase()}</Tag>}
          </div>
          {own && !editing && <button className="btn-outline" onClick={startEdit}><Pencil className="h-4 w-4" /> Edit profile</button>}
        </div>
      </div>

      {editing ? (
        <form onSubmit={save} className="card mt-6 space-y-5 p-6">
          <div>
            <label className="label" htmlFor="bio">Bio</label>
            <textarea id="bio" rows={3} className="input" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="role">Role</label>
              <input id="role" className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Frontend Developer" />
            </div>
            <div>
              <label className="label" htmlFor="avail">Availability</label>
              <input id="avail" className="input" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} placeholder="Weekends" />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="skills">Skills (comma separated)</label>
            <input id="skills" className="input" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="React, Python, UI/UX" />
          </div>
          <div className="flex gap-3">
            <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
            <button type="button" className="btn-outline" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="mt-8 space-y-8">
          <section>
            <h2 className="text-xl font-semibold">About</h2>
            <p className="mt-2 max-w-2xl text-ink-soft">{profile.bio || (own ? 'Add a short bio so teams know what you like to build.' : 'No bio yet.')}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Skills</h2>
            <div className="mt-3">{profile.skills?.length ? <SkillTags skills={profile.skills} /> : <p className="text-ink-soft">{own ? 'Add your skills so Apricus can match you to teams.' : 'No skills listed.'}</p>}</div>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Teams</h2>
            {myTeams.length === 0 ? <p className="mt-2 text-ink-soft">Not on a team yet. <Link to="/teams" className="font-medium text-lilac-700 hover:underline">Browse teams</Link></p> : (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {myTeams.map((t) => <Link key={t.id} to={`/teams/${t.id}`} className="card p-4 hover:shadow-md"><p className="font-display font-semibold">{t.name}</p><p className="text-sm text-ink-soft">{t.description}</p></Link>)}
              </div>
            )}
          </section>
          {myHacks.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold">Hackathons</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {myHacks.map((h) => <Link key={h.id} to={`/hackathons/${h.id}`}><Tag tone={tones.sky}>{h.title}</Tag></Link>)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
