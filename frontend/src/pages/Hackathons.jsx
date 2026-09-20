import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { useAsync } from '../hooks'
import { getHackathons, getCompanies, getDomains } from '../services/api'
import { allSkills } from '../data/mockData'
import MagicBento from '../components/MagicBento'
import HackathonBentoCard from '../components/HackathonBentoCard'
import { PageHeader, Spinner, EmptyState } from '../components/ui'

const modes = ['Online', 'In-Person', 'Hybrid']

function Select({ label, value, onChange, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>{children}</select>
    </div>
  )
}

export default function Hackathons() {
  const [params, setParams] = useSearchParams()
  const filters = useMemo(() => Object.fromEntries(params.entries()), [params])
  const { data: hackathons, loading } = useAsync(() => getHackathons(filters), [params.toString()])
  const { data: companies } = useAsync(getCompanies)
  const { data: domains } = useAsync(getDomains)

  const set = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }
  const active = Array.from(params.keys()).filter((k) => k !== 'sort').length

  return (
    <>
      <PageHeader title="Hackathons" subtitle="Filter by what you know, where you are and how big your team is." />
      <div className="container-page mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="card h-fit space-y-4 p-5">
          <div>
            <label className="label" htmlFor="search">Search</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <input id="search" className="input pl-9" placeholder="Title or company" value={filters.search || ''} onChange={(e) => set('search', e.target.value)} />
            </div>
          </div>
          <Select label="Domain" value={filters.domain || ''} onChange={(v) => set('domain', v)}>
            <option value="">All domains</option>
            {(domains || []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
          <Select label="Company" value={filters.company || ''} onChange={(v) => set('company', v)}>
            <option value="">All companies</option>
            {(companies || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select label="Mode" value={filters.mode || ''} onChange={(v) => set('mode', v)}>
            <option value="">Any mode</option>
            {modes.map((m) => <option key={m}>{m}</option>)}
          </Select>
          <Select label="Skill" value={filters.skill || ''} onChange={(v) => set('skill', v)}>
            <option value="">Any skill</option>
            {allSkills.map((s) => <option key={s}>{s}</option>)}
          </Select>
          <Select label="Team size" value={filters.teamSize || ''} onChange={(v) => set('teamSize', v)}>
            <option value="">Any size</option>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>)}
          </Select>
          <Select label="Sort by" value={filters.sort || ''} onChange={(v) => set('sort', v)}>
            <option value="">Default</option>
            <option value="deadline">Deadline (soonest)</option>
            <option value="newest">Start date (latest)</option>
          </Select>
          {active > 0 && (
            <button className="btn-soft w-full" onClick={() => setParams({}, { replace: true })}>
              <X className="h-4 w-4" /> Clear {active} filter{active === 1 ? '' : 's'}
            </button>
          )}
        </aside>

        <section aria-live="polite">
          {loading ? <Spinner /> : hackathons.length === 0 ? (
            <EmptyState title="No hackathons match" message="Try removing a filter or searching for a different name." action={<button className="btn-primary" onClick={() => setParams({}, { replace: true })}>Clear filters</button>} />
          ) : (
            <>
              <p className="mb-4 text-sm text-ink-soft">{hackathons.length} hackathon{hackathons.length === 1 ? '' : 's'}</p>
              <MagicBento
                cards={hackathons.map((h) => ({
                  id: h.id,
                  to: `/hackathons/${h.id}`,
                  children: ({ wide }) => <HackathonBentoCard hackathon={h} wide={wide} />,
                }))}
                linkComponent={Link}
                textAutoHide={true}
                enableStars={true}
                enableSpotlight={true}
                enableBorderGlow={true}
                enableTilt={true}
                enableMagnetism={true}
                clickEffect={true}
                spotlightRadius={300}
                particleCount={12}
                glowColor="132, 0, 255"
              />
            </>
          )}
        </section>
      </div>
    </>
  )
}
