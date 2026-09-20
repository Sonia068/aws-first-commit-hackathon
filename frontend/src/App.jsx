import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import GlowCursor from './components/GlowCursor'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Hackathons from './pages/Hackathons'
import HackathonDetail from './pages/HackathonDetail'
import Companies from './pages/Companies'
import CompanyDetail from './pages/CompanyDetail'
import Domains from './pages/Domains'
import DomainDetail from './pages/DomainDetail'
import Teams from './pages/Teams'
import TeamDetail from './pages/TeamDetail'
import CreateTeam from './pages/CreateTeam'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Signup from './pages/Signup'
import NotFound from './pages/NotFound'

// Only show the cursor trail on devices with a real mouse; touch screens have no hover.
function useFinePointer() {
  const query = '(hover: hover) and (pointer: fine)'
  const [fine, setFine] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = (e) => setFine(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return fine
}

export default function App() {
  const finePointer = useFinePointer()
  return (
    <>
      {finePointer && (
        <GlowCursor
          fixed
          depth={1}
          shadow={0.7}
          blendMode="normal"
          color="#5227FF"
          secondaryColor="#FF8AF0"
          trailLength={34}
          trailWidth={2.5}
          trailTaper={0.8}
          followSpeed={0.4}
          glowIntensity={1.3}
          glowSpread={0.8}
          hotspot={0.55}
          brightness={1.2}
          opacity={1}
          pulseSpeed={1.1}
          noiseStrength={0.035}
          idleFade
          idleTimeout={500}
          fadeDuration={700}
        />
      )}
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/hackathons" element={<Hackathons />} />
        <Route path="/hackathons/:id" element={<HackathonDetail />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/companies/:id" element={<CompanyDetail />} />
        <Route path="/domains" element={<Domains />} />
        <Route path="/domains/:id" element={<DomainDetail />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/teams/new" element={<ProtectedRoute><CreateTeam /></ProtectedRoute>} />
        <Route path="/teams/:id" element={<TeamDetail />} />
        <Route path="/students/:id" element={<Profile />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
    </>
  )
}
