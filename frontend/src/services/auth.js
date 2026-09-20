// Mock authentication service. Replace with real API calls to the FastAPI
// backend later — the shape of these functions is designed to stay the same.

const STORAGE_KEY = 'apricus_user'

const mockUsers = [
  {
    id: 's1',
    name: 'Ananya Rao',
    email: 'ananya@student.edu',
    password: 'password123',
    role: 'student',
    university: 'IIT Bombay',
  },
  {
    id: 'admin1',
    name: 'Apricus Admin',
    email: 'admin@apricus.io',
    password: 'admin123',
    role: 'admin',
    university: 'Apricus',
  },
]

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

export async function login(email, password) {
  await delay()
  const user = mockUsers.find((u) => u.email === email && u.password === password)
  if (!user) throw new Error('Invalid email or password.')
  const { password: _pw, ...safeUser } = user
  localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser))
  return safeUser
}

export async function signup({ name, email, password, university, role }) {
  await delay()
  if (mockUsers.some((u) => u.email === email)) {
    throw new Error('An account with this email already exists.')
  }
  const newUser = {
    id: `s${mockUsers.length + 1}`,
    name,
    email,
    university,
    role,
  }
  mockUsers.push({ ...newUser, password })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
  return newUser
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY)
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
