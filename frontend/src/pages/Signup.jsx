import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', university: '', role: 'student' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) return setError('Use a password with at least 6 characters.')
    setBusy(true)
    setError('')
    try {
      await signup({ ...form, email: form.email.trim(), name: form.name.trim() })
      navigate('/profile', { replace: true })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-[70vh] place-items-center bg-mint-50 px-4 py-12">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-ink-soft">It takes a minute. You can fill in skills afterwards.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="n">Full name</label>
            <input id="n" required className="input" value={form.name} onChange={set('name')} />
          </div>
          <div>
            <label className="label" htmlFor="e">Email</label>
            <input id="e" type="email" required className="input" value={form.email} onChange={set('email')} />
          </div>
          <div>
            <label className="label" htmlFor="u">University</label>
            <input id="u" required className="input" value={form.university} onChange={set('university')} />
          </div>
          <div>
            <label className="label" htmlFor="p">Password</label>
            <input id="p" type="password" required className="input" value={form.password} onChange={set('password')} />
          </div>
          {error && <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700" role="alert">{error}</p>}
          <button className="btn-primary w-full" disabled={busy}>{busy ? 'Creating account…' : 'Sign up'}</button>
        </form>
        <p className="mt-5 text-center text-sm text-ink-soft">Already have an account? <Link to="/login" className="font-medium text-lilac-700 hover:underline">Log in</Link></p>
      </div>
    </div>
  )
}
