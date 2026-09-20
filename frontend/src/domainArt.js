// Generates a self-contained illustration (SVG data URI) for each domain, used as the
// image on the Browse by domain gallery. No network requests, so it always loads.
const palette = {
  'ai-ml': ['#8B7BD8', '#DDD6FB', '#5B4BA8'],
  'web-dev': ['#4E9FDB', '#BADFFA', '#256A9E'],
  cloud: ['#4FB287', '#BFEBD4', '#2C7A59'],
  cybersecurity: ['#DB5F80', '#FFC7D5', '#A03657'],
  'data-science': ['#D4A72C', '#FCE58C', '#8A6B10'],
  blockchain: ['#E9895A', '#FFD3BA', '#A9552C'],
  fintech: ['#E9895A', '#FFE9DB', '#A9552C'],
  iot: ['#4FB287', '#DDF5E9', '#2C7A59'],
}

// One simple motif per domain, drawn in a 800x600 space.
const motifs = {
  'ai-ml': (c) => {
    const nodes = [[220, 200], [220, 300], [220, 400], [400, 160], [400, 260], [400, 340], [400, 440], [580, 250], [580, 350]]
    const edges = []
    for (const a of nodes.slice(0, 3)) for (const b of nodes.slice(3, 7)) edges.push(`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`)
    for (const a of nodes.slice(3, 7)) for (const b of nodes.slice(7)) edges.push(`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`)
    return `<g stroke="${c[2]}" stroke-opacity=".35" stroke-width="3">${edges.join('')}</g>` +
      nodes.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="22" fill="#fff"/><circle cx="${x}" cy="${y}" r="10" fill="${c[2]}"/>`).join('')
  },
  'web-dev': (c) =>
    `<rect x="150" y="130" width="500" height="340" rx="26" fill="#fff"/>` +
    `<rect x="150" y="130" width="500" height="64" rx="26" fill="${c[2]}"/><rect x="150" y="170" width="500" height="24" fill="${c[2]}"/>` +
    `<circle cx="188" cy="162" r="9" fill="#fff" fill-opacity=".8"/><circle cx="218" cy="162" r="9" fill="#fff" fill-opacity=".6"/><circle cx="248" cy="162" r="9" fill="#fff" fill-opacity=".4"/>` +
    `<path d="M300 300l-50 40 50 40M500 300l50 40-50 40M370 390l60-100" fill="none" stroke="${c[0]}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`,
  cloud: (c) =>
    `<path d="M250 420a90 90 0 0 1-8-180 130 130 0 0 1 250-30 105 105 0 0 1 58 210z" fill="#fff"/>` +
    `<g fill="${c[2]}"><rect x="310" y="330" width="180" height="16" rx="8"/><rect x="340" y="365" width="120" height="16" rx="8" fill-opacity=".6"/></g>`,
  cybersecurity: (c) =>
    `<path d="M400 100l190 70v140c0 110-80 180-190 210-110-30-190-100-190-210V170z" fill="#fff"/>` +
    `<rect x="345" y="270" width="110" height="90" rx="16" fill="${c[2]}"/>` +
    `<path d="M365 270v-30a35 35 0 0 1 70 0v30" fill="none" stroke="${c[2]}" stroke-width="16" stroke-linecap="round"/>` +
    `<circle cx="400" cy="315" r="12" fill="#fff"/>`,
  'data-science': (c) =>
    `<rect x="150" y="120" width="500" height="360" rx="26" fill="#fff"/>` +
    [0, 1, 2, 3, 4].map((i) => `<rect x="${200 + i * 84}" y="${400 - [90, 170, 120, 220, 160][i]}" width="52" height="${[90, 170, 120, 220, 160][i]}" rx="10" fill="${i % 2 ? c[0] : c[2]}"/>`).join('') +
    `<path d="M215 300L300 230 384 270 468 190 552 240" fill="none" stroke="${c[2]}" stroke-opacity=".45" stroke-width="6" stroke-linecap="round" stroke-dasharray="2 14"/>`,
  blockchain: (c) =>
    [[250, 260], [400, 260], [550, 260]].map(([x, y], i) =>
      `<rect x="${x - 60}" y="${y - 60}" width="120" height="120" rx="22" fill="#fff"/><rect x="${x - 28}" y="${y - 28}" width="56" height="56" rx="10" fill="${i === 1 ? c[2] : c[0]}"/>`
    ).join('') +
    `<g stroke="#fff" stroke-width="10" stroke-linecap="round"><line x1="310" y1="260" x2="340" y2="260"/><line x1="460" y1="260" x2="490" y2="260"/></g>` +
    `<rect x="325" y="360" width="150" height="110" rx="22" fill="#fff" fill-opacity=".85"/>`,
  fintech: (c) =>
    `<circle cx="400" cy="300" r="170" fill="#fff"/><circle cx="400" cy="300" r="130" fill="none" stroke="${c[0]}" stroke-width="10" stroke-dasharray="4 18" stroke-linecap="round"/>` +
    `<text x="400" y="352" font-family="Georgia,serif" font-size="150" font-weight="700" text-anchor="middle" fill="${c[2]}">₹</text>`,
  iot: (c) =>
    `<rect x="300" y="200" width="200" height="200" rx="26" fill="#fff"/><rect x="345" y="245" width="110" height="110" rx="14" fill="${c[2]}"/>` +
    [0, 1, 2, 3].map((i) => `<rect x="${330 + i * 45}" y="168" width="14" height="32" rx="5" fill="#fff"/><rect x="${330 + i * 45}" y="400" width="14" height="32" rx="5" fill="#fff"/>`).join('') +
    [0, 1, 2, 3].map((i) => `<rect x="268" y="${230 + i * 45}" width="32" height="14" rx="5" fill="#fff"/><rect x="500" y="${230 + i * 45}" width="32" height="14" rx="5" fill="#fff"/>`).join('') +
    `<g fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-opacity=".8"><path d="M580 190a90 90 0 0 1 90 90"/><path d="M580 140a140 140 0 0 1 140 140"/></g>`,
}

export function domainImage(id) {
  const c = palette[id] || palette['ai-ml']
  const motif = (motifs[id] || motifs['ai-ml'])(c)
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[0]}"/></linearGradient></defs>` +
    `<rect width="800" height="600" fill="url(#g)"/>` +
    `<circle cx="680" cy="70" r="150" fill="#fff" fill-opacity=".18"/><circle cx="90" cy="540" r="120" fill="${c[2]}" fill-opacity=".14"/>` +
    motif + `</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
