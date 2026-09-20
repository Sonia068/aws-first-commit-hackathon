# Apricus

Hackathon discovery and team matching for students. React + Vite + JavaScript (JSX) + Tailwind CSS + React Router + Lucide React.

## Run
    npm install
    npm run dev

## Demo logins
- Student: ananya@student.edu / password123
- Admin: admin@apricus.io / admin123

## Structure
- src/data/mockData.js – all fictional data and match helpers
- src/services/api.js – the only place that talks to a backend (swap for FastAPI calls; set VITE_API_BASE_URL)
- src/services/auth.js – mock auth, same shape for the real API
- src/pages – Home, Hackathons, HackathonDetail, Companies, Domains, Teams, TeamDetail, CreateTeam, Profile, Login, Signup
- Palette: white base with pastel lilac, mint, peach, sky, butter and rose (tailwind.config.js). The Home hero uses the Lightfall WebGL background (src/components/Lightfall.jsx, powered by ogl); the rest of the site stays white with pastels.
- Cursor: src/components/GlowCursor.jsx (React Bits, extended with `depth`, `shadow` and `fixed` props) renders a lit 3D trail site-wide. It is mounted once in App.jsx and only on devices with a mouse. Set `depth={0}` for the original flat glow.
- Hackathons page: src/components/MagicBento.jsx (React Bits, extended with a `cards` prop and router-link cards, powered by gsap) lays the results out as a bento grid with spotlight, border glow, tilt, magnetism and particles. Card content lives in src/components/HackathonBentoCard.jsx.
- Browse by domain (Home): src/components/CircularGallery.jsx (React Bits, powered by ogl) shows one card per domain; clicking a card opens /hackathons?domain=<id> (the component was extended with an `onItemClick` prop). Card art is generated in src/domainArt.js as inline SVGs, so it needs no image hosting.
