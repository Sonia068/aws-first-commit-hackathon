import { request } from './api'

const STORAGE_KEY = 'apricus_user'

function save({ token, user }) {
  localStorage.setItem('apricus_token', token)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  return user
}

export async function login(email, password) {
  return save(await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }))
}

export async function signup({ name, email, password }) {
  return save(await request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }))
}

export function logout() {
  localStorage.removeItem('apricus_token')
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
