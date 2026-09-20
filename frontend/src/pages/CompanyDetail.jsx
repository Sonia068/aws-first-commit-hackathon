import { Link, useParams } from 'react-router-dom'
import { useAsync } from '../hooks'
import { getCompany } from '../services/api'
import { domains } from '../data/mockData'
import HackathonCard from '../components/HackathonCard'
import { BackLink, Spinner, EmptyState, Tag } from '../components/ui'
import { initials, toneForDomain, tones } from '../utils'

export default function CompanyDetail() {
  const { id } = useParams()
  const { data: c, loading } = useAsync(() => getCompany(id), [id])
  if (loading) return <Spinner />
  if (!c) return <div className="container-page py-16"><EmptyState title="Company not found" action={<Link to="/companies" className="btn-primary">All companies</Link>} /></div>
  return (
    <div className="container-page py-10">
      <BackLink to="/companies">All companies</BackLink>
      <div className="flex flex-col gap-5 rounded-3xl bg-mint-50 p-8 sm:flex-row sm:items-center">
        <span className={`grid h-20 w-20 shrink-0 place-items-center rounded-3xl font-display text-2xl font-bold ${tones.mint.bg} ${tones.mint.text}`}>{initials(c.name)}</span>
        <div>
          <h1 className="text-3xl font-semibold">{c.name}</h1>
          <p className="mt-2 max-w-2xl text-ink-soft">{c.about}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {c.domains.map((d) => <Tag key={d} tone={toneForDomain(d)}>{domains.find((x) => x.id === d)?.name}</Tag>)}
          </div>
        </div>
      </div>
      <h2 className="mt-10 text-2xl font-semibold">Hackathons by {c.name}</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {c.hackathons.map((h) => <HackathonCard key={h.id} hackathon={h} />)}
      </div>
    </div>
  )
}
