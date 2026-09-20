import { Link, useParams } from 'react-router-dom'
import { useAsync } from '../hooks'
import { getDomain } from '../services/api'
import HackathonCard from '../components/HackathonCard'
import { BackLink, Spinner, EmptyState } from '../components/ui'
import { toneForDomain } from '../utils'

export default function DomainDetail() {
  const { id } = useParams()
  const { data: d, loading } = useAsync(() => getDomain(id), [id])
  if (loading) return <Spinner />
  if (!d) return <div className="container-page py-16"><EmptyState title="Domain not found" action={<Link to="/domains" className="btn-primary">All domains</Link>} /></div>
  const t = toneForDomain(d.id)
  return (
    <div className="container-page py-10">
      <BackLink to="/domains">All domains</BackLink>
      <div className={`rounded-3xl p-8 ${t.soft}`}>
        <h1 className="text-3xl font-semibold">{d.name}</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">{d.description}</p>
      </div>
      <div className="mt-8">
        {d.hackathons.length === 0 ? (
          <EmptyState title="No hackathons in this domain yet" message="Check back soon or browse another domain." action={<Link to="/hackathons" className="btn-primary">Browse all hackathons</Link>} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {d.hackathons.map((h) => <HackathonCard key={h.id} hackathon={h} />)}
          </div>
        )}
      </div>
    </div>
  )
}
