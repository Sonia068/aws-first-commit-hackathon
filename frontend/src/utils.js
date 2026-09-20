export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatRange(start, end) {
  const s = new Date(start)
  const e = new Date(end)
  const sameMonth = s.getMonth() === e.getMonth()
  const day = (d) => d.toLocaleDateString('en-IN', { day: 'numeric' })
  const mon = (d) => d.toLocaleDateString('en-IN', { month: 'short' })
  return sameMonth
    ? `${day(s)}–${day(e)} ${mon(e)} ${e.getFullYear()}`
    : `${day(s)} ${mon(s)} – ${day(e)} ${mon(e)} ${e.getFullYear()}`
}

export function daysLeft(iso) {
  const ms = new Date(iso).setHours(23, 59, 59) - Date.now()
  return Math.ceil(ms / 86400000)
}

// Pastel tones per domain / mode, all as Tailwind class strings.
export const tones = {
  lilac: { bg: 'bg-lilac-100', text: 'text-lilac-700', soft: 'bg-lilac-50', bar: 'bg-lilac-500' },
  mint: { bg: 'bg-mint-100', text: 'text-mint-700', soft: 'bg-mint-50', bar: 'bg-mint-500' },
  peach: { bg: 'bg-peach-100', text: 'text-peach-700', soft: 'bg-peach-50', bar: 'bg-peach-500' },
  sky: { bg: 'bg-sky-100', text: 'text-sky-700', soft: 'bg-sky-50', bar: 'bg-sky-500' },
  butter: { bg: 'bg-butter-100', text: 'text-butter-700', soft: 'bg-butter-50', bar: 'bg-butter-500' },
  rose: { bg: 'bg-rose-100', text: 'text-rose-700', soft: 'bg-rose-50', bar: 'bg-rose-500' },
}

const domainTone = {
  'ai-ml': 'lilac',
  'web-dev': 'sky',
  cloud: 'mint',
  cybersecurity: 'rose',
  'data-science': 'butter',
  blockchain: 'peach',
  fintech: 'peach',
  iot: 'mint',
}

export function toneForDomain(id) {
  return tones[domainTone[id] || 'lilac']
}

const cycle = ['lilac', 'mint', 'peach', 'sky', 'butter', 'rose']
export function toneByIndex(i) {
  return tones[cycle[i % cycle.length]]
}

export function initials(name = '') {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
