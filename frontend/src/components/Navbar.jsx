import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Avatar } from './ui'

const links = [
  { to: '/hackathons', label: 'Hackathons' },
  { to: '/companies', label: 'Companies' },
  { to: '/domains', label: 'Domains' },
  { to: '/teams', label: 'Teams' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-lilac-100 text-lilac-700' : 'text-ink-soft hover:bg-lilac-50 hover:text-ink'
    }`

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-lilac-200 text-lilac-700">
            <Sparkles className="h-4 w-4" />
          </span>
          Apricus
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>{l.label}</NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-lilac-50">
                <Avatar name={user.name} size="sm" />
                <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="btn-outline">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-outline">Log in</Link>
              <Link to="/signup" className="btn-primary">Sign up</Link>
            </>
          )}
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-lg hover:bg-lilac-50 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-white px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)}>{l.label}</NavLink>
            ))}
            {isAuthenticated ? (
              <>
                <NavLink to="/profile" className={linkClass} onClick={() => setOpen(false)}>My profile</NavLink>
                <button onClick={handleLogout} className="btn-outline mt-2">Log out</button>
              </>
            ) : (
              <div className="mt-2 flex gap-2">
                <Link to="/login" className="btn-outline flex-1" onClick={() => setOpen(false)}>Log in</Link>
                <Link to="/signup" className="btn-primary flex-1" onClick={() => setOpen(false)}>Sign up</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
