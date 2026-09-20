// Centralized API layer. Currently backed by mock data; swap the bodies of
// these functions for real `fetch(`${API_BASE_URL}/...`)` calls when the
// FastAPI backend is ready. Keep this file as the only place that talks to
// the network so UI components never call fetch directly.

import {
  hackathons,
  companies,
  domains,
  teams,
  students,
  getTeamCompletion,
  getMatchForStudent,
} from '../data/mockData'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))

let mockTeams = [...teams]
let mockStudents = [...students]

export async function getHackathons(filters = {}) {
  await delay()
  let results = [...hackathons]
  if (filters.search) {
    const q = filters.search.toLowerCase()
    results = results.filter(
      (h) => h.title.toLowerCase().includes(q) || h.organizer.toLowerCase().includes(q)
    )
  }
  if (filters.domain) results = results.filter((h) => h.domain === filters.domain)
  if (filters.company) results = results.filter((h) => h.companyId === filters.company)
  if (filters.mode) results = results.filter((h) => h.mode === filters.mode)
  if (filters.skill) results = results.filter((h) => h.requiredSkills.includes(filters.skill))
  if (filters.teamSize)
    results = results.filter(
      (h) => h.teamSizeMax >= Number(filters.teamSize) && h.teamSizeMin <= Number(filters.teamSize)
    )
  if (filters.sort === 'deadline') {
    results = results.sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
  } else if (filters.sort === 'newest') {
    results = results.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
  }
  return results
}

export async function getHackathon(id) {
  await delay()
  return hackathons.find((h) => h.id === id) || null
}

export async function getCompanies() {
  await delay()
  return companies.map((c) => ({
    ...c,
    opportunityCount: hackathons.filter((h) => h.companyId === c.id).length,
  }))
}

export async function getCompany(id) {
  await delay()
  const company = companies.find((c) => c.id === id)
  if (!company) return null
  return {
    ...company,
    hackathons: hackathons.filter((h) => h.companyId === id),
  }
}

export async function getDomains() {
  await delay()
  return domains.map((d) => ({
    ...d,
    opportunityCount: hackathons.filter((h) => h.domain === d.id).length,
  }))
}

export async function getDomain(id) {
  await delay()
  const domain = domains.find((d) => d.id === id)
  if (!domain) return null
  return { ...domain, hackathons: hackathons.filter((h) => h.domain === id) }
}

export async function getTeams() {
  await delay()
  return mockTeams.map((t) => ({ ...t, ...getTeamCompletion(t) }))
}

export async function getTeam(id) {
  await delay()
  const team = mockTeams.find((t) => t.id === id)
  if (!team) return null
  return { ...team, ...getTeamCompletion(team) }
}

export async function createTeam(data) {
  await delay()
  const newTeam = {
    id: `t${mockTeams.length + 1}`,
    memberIds: [],
    status: 'Recruiting',
    ...data,
  }
  mockTeams = [...mockTeams, newTeam]
  return { ...newTeam, ...getTeamCompletion(newTeam) }
}

export async function getRecommendedTeammates({ requiredSkills = [], excludeIds = [] } = {}) {
  await delay()
  return mockStudents
    .filter((s) => !excludeIds.includes(s.id))
    .map((s) => ({ ...s, ...getMatchForStudent(s, requiredSkills) }))
    .sort((a, b) => b.percent - a.percent)
}

export async function getStudents() {
  await delay()
  return mockStudents
}

export async function getProfile(id) {
  await delay()
  return mockStudents.find((s) => s.id === id) || null
}

export async function updateProfile(id, data) {
  await delay()
  if (mockStudents.some((s) => s.id === id)) {
    mockStudents = mockStudents.map((s) => (s.id === id ? { ...s, ...data } : s))
  } else {
    // First save for a newly signed-up user creates their profile.
    mockStudents = [
      ...mockStudents,
      { id, bio: '', skills: [], domains: [], role: '', availability: '', hackathons: [], teams: [], ...data },
    ]
  }
  return mockStudents.find((s) => s.id === id)
}
