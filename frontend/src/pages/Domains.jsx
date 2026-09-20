import { Link } from 'react-router-dom'
import { useAsync } from '../hooks'
import { getDomains } from '../services/api'
import { PageHeader, Spinner } from '../components/ui'
import { toneForDomain } from '../utils'

export default function Domains() {
  const { data, loading } = useAsync(getDomains)
  return (
    <>
      <PageHeader title="Domains" subtitle="Pick a field and see every hackathon in it." tone="bg-sky-50" />
      <div className="container-page mt-8">
        {loading ? <Spinner /> : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.map((d) => {
              const t = toneForDomain(d.id)
              return (
                <Link key={d.id} to={`/domains/${d.id}`} className={`rounded-3xl p-6 transition-all hover:-translate-y-0.5 ${t.bg}`}>
                  <h2 className={`text-xl font-semibold ${t.text}`}>{d.name}</h2>
                  <p className="mt-2 text-sm text-ink-soft">{d.description}</p>
                  <p className="mt-6 text-sm font-medium">{d.opportunityCount} hackathon{d.opportunityCount === 1 ? '' : 's'}</p>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
