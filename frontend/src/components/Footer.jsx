import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-lilac-50">
      <div className="container-page flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-lg font-bold">Apricus</p>
          <p className="mt-1 text-sm text-ink-soft">Find hackathons and the teammates to enter them with.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft" aria-label="Footer">
          <Link to="/hackathons" className="hover:text-ink">Hackathons</Link>
          <Link to="/companies" className="hover:text-ink">Companies</Link>
          <Link to="/domains" className="hover:text-ink">Domains</Link>
          <Link to="/teams" className="hover:text-ink">Teams</Link>
        </nav>
      </div>
      <p className="border-t border-line py-4 text-center text-xs text-ink-faint">
        Demo data is fictional. © 2026 Apricus
      </p>
    </footer>
  )
}
