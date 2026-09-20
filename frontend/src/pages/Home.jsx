import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Search, Users, Target } from 'lucide-react'
import { useMemo } from 'react'
import { useAsync } from '../hooks'
import { getHackathons, getCompanies, getDomains } from '../services/api'
import HackathonCard from '../components/HackathonCard'
import Lightfall from '../components/Lightfall'
import CircularGallery from '../components/CircularGallery'
import { Spinner } from '../components/ui'
import { toneByIndex } from '../utils'
import { domainImage } from '../domainArt'

// Defined outside the component so the array keeps the same reference between renders.
// Lightfall rebuilds its WebGL context whenever `colors` changes identity.
const LIGHTFALL_COLORS = ['#A6C8FF', '#5227FF', '#FF9FFC']

export default function Home() {
  const { data: hackathons, loading } = useAsync(() => getHackathons({ sort: 'deadline' }))
  const { data: domains } = useAsync(getDomains)
  const { data: companies } = useAsync(getCompanies)
  const navigate = useNavigate()
  const featured = (hackathons || []).filter((h) => h.featured)
  // Stable reference: CircularGallery rebuilds its WebGL scene whenever `items` changes identity.
  const domainItems = useMemo(
    () => (domains || []).map((d) => ({ id: d.id, image: domainImage(d.id), text: d.name })),
    [domains]
  )
  const closing = (hackathons || []).slice(0, 3)

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-[#0A1240]">
        <div className="absolute inset-0">
          <Lightfall
            colors={LIGHTFALL_COLORS}
            backgroundColor="#0A29FF"
            speed={1}
            streakCount={8}
            streakWidth={1}
            streakLength={1}
            glow={1}
            density={1}
            twinkle={1}
            zoom={2}
            backgroundGlow={1}
            opacity={1}
            mouseInteraction={true}
            mouseStrength={1}
            mouseRadius={0.6}
          />
        </div>

        {/* pointer-events-none lets the cursor light reach the canvas; buttons opt back in */}
        <div className="container-page pointer-events-none relative z-10 grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <h1 className="text-4xl font-semibold leading-tight text-white [text-shadow:0_2px_24px_rgba(4,8,40,0.65)] sm:text-5xl">
              Find the hackathon. Find the team. Ship the thing.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-white/90 [text-shadow:0_1px_14px_rgba(4,8,40,0.75)]">
              Apricus lists student hackathons from top companies and matches you with teammates whose skills fill the gaps in your team.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/hackathons" className="btn-primary pointer-events-auto px-5 py-3">Browse hackathons <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/teams" className="btn-outline pointer-events-auto px-5 py-3">Find a team</Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4" aria-hidden="true">
            <div className="rounded-3xl bg-mint-100 p-6">
              <Search className="h-6 w-6 text-mint-700" />
              <p className="mt-6 font-display text-lg font-semibold">Filter by skill, domain and mode</p>
            </div>
            <div className="mt-8 rounded-3xl bg-peach-100 p-6">
              <Users className="h-6 w-6 text-peach-700" />
              <p className="mt-6 font-display text-lg font-semibold">See who fits your team</p>
            </div>
            <div className="rounded-3xl bg-sky-100 p-6">
              <Target className="h-6 w-6 text-sky-700" />
              <p className="mt-6 font-display text-lg font-semibold">Track missing skills</p>
            </div>
            <div className="mt-8 rounded-3xl bg-butter-100 p-6">
              <p className="font-display text-3xl font-bold text-butter-700">{hackathons ? hackathons.length : '–'}</p>
              <p className="mt-6 font-display text-lg font-semibold">open hackathons right now</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page mt-16">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold sm:text-3xl">Featured hackathons</h2>
          <Link to="/hackathons" className="text-sm font-medium text-lilac-700 hover:underline">See all</Link>
        </div>
        {loading ? <Spinner /> : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((h) => <HackathonCard key={h.id} hackathon={h} />)}
          </div>
        )}
      </section>

      <section className="container-page mt-16">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold sm:text-3xl">Browse by domain</h2>
          <Link to="/domains" className="text-sm font-medium text-lilac-700 hover:underline">See all domains</Link>
        </div>
        {domainItems.length > 0 && (
          <div className="mt-6" style={{ height: '520px', position: 'relative' }}>
            <CircularGallery
              items={domainItems}
              bend={3}
              textColor="#2F3542"
              borderRadius={0.05}
              scrollEase={0.02}
              font="bold 30px Bricolage Grotesque"
              onItemClick={(item) => navigate(`/hackathons?domain=${encodeURIComponent(item.id)}`)}
            />
          </div>
        )}
      </section>

      <section className="container-page mt-16">
        <h2 className="text-2xl font-semibold sm:text-3xl">Closing soon</h2>
        <p className="mt-1 text-ink-soft">Apply before these deadlines pass.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {closing.map((h) => <HackathonCard key={h.id} hackathon={h} />)}
        </div>
      </section>

      <section className="container-page mt-16">
        <h2 className="text-2xl font-semibold sm:text-3xl">Companies hosting</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {(companies || []).map((c, i) => {
            const t = toneByIndex(i)
            return (
              <Link key={c.id} to={`/companies/${c.id}`} className={`rounded-full px-5 py-2.5 text-sm font-semibold ${t.bg} ${t.text} hover:brightness-95`}>
                {c.name}
              </Link>
            )
          })}
        </div>
      </section>

      <section className="container-page mt-16">
        <div className="rounded-3xl bg-peach-50 p-8 sm:p-12">
          <h2 className="max-w-xl text-2xl font-semibold sm:text-3xl">Have an idea but not the full team?</h2>
          <p className="mt-2 max-w-lg text-ink-soft">Start a team, list the skills you need, and Apricus ranks students by how well they fill the gap.</p>
          <Link to="/teams/new" className="btn-primary mt-6">Create a team</Link>
        </div>
      </section>
    </>
  )
}
