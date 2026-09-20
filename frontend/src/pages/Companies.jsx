import { Link } from 'react-router-dom'
import { useAsync } from '../hooks'
import { getCompanies } from '../services/api'
import { domains } from '../data/mockData'
import { PageHeader, Spinner, Tag } from '../components/ui'
import { toneByIndex, toneForDomain, initials } from '../utils'

export default function Companies() {
  const { data, loading } = useAsync(getCompanies)
  return (
    <>
      <PageHeader title="Companies" subtitle="Organisations running student hackathons on Apricus." tone="bg-mint-50" />
      <div className="container-page mt-8">
        {loading ? <Spinner /> : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((c, i) => {
              const t = toneByIndex(i)
              return (
                <Link key={c.id} to={`/companies/${c.id}`} className="card p-6 transition-shadow hover:shadow-md">
                  <span className={`grid h-12 w-12 place-items-center rounded-2xl font-display text-lg font-bold ${t.bg} ${t.text}`}>{initials(c.name)}</span>
                  <h2 className="mt-4 text-xl font-semibold">{c.name}</h2>
                  <p className="mt-2 line-clamp-3 text-sm text-ink-soft">{c.about}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {c.domains.map((d) => <Tag key={d} tone={toneForDomain(d)}>{domains.find((x) => x.id === d)?.name}</Tag>)}
                  </div>
                  <p className="mt-4 text-sm font-medium">{c.opportunityCount} hackathon{c.opportunityCount === 1 ? '' : 's'}</p>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
