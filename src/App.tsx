import { useEffect, useRef } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Dashboard from './screens/Dashboard'
import Learn from './screens/Learn'
import Lesson from './screens/Lesson'
import PracticeRoom from './screens/PracticeRoom'
import ScenarioLibrary from './screens/ScenarioLibrary'
import ErrorLog from './screens/ErrorLog'
import PhraseBank from './screens/PhraseBank'
import Progress from './screens/Progress'
import { useAppStore } from './store/app'
import { SUPABASE_ENABLED } from './lib/supabase'
import { pullRemote, pushRemote } from './lib/sync'

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--fos-bg)' }}>
      <Nav />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</div>
    </div>
  )
}

export default function App() {
  // Snapshot the slices that should trigger a cloud backup
  const mistakes = useAppStore((s) => s.mistakes)
  const phrases = useAppStore((s) => s.phrases)
  const sessions = useAppStore((s) => s.sessions)
  const profile = useAppStore((s) => s.profile)
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const booted = useRef(false)

  // Pull remote backup once on boot (best-effort, no-op if Supabase unset)
  useEffect(() => {
    if (SUPABASE_ENABLED) pullRemote().finally(() => { booted.current = true })
    else booted.current = true
  }, [])

  // Debounced backup to Supabase whenever data changes
  useEffect(() => {
    if (!SUPABASE_ENABLED || !booted.current) return
    if (pushTimer.current) clearTimeout(pushTimer.current)
    pushTimer.current = setTimeout(() => pushRemote(), 1500)
    return () => { if (pushTimer.current) clearTimeout(pushTimer.current) }
  }, [mistakes, phrases, sessions, profile])

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/learn" element={<Layout><Learn /></Layout>} />
        <Route path="/learn/:id" element={<Layout><Lesson /></Layout>} />
        <Route path="/practice" element={<Layout><PracticeRoom /></Layout>} />
        <Route path="/practice/:scenarioId" element={<Layout><PracticeRoom /></Layout>} />
        <Route path="/scenarios" element={<Layout><ScenarioLibrary /></Layout>} />
        <Route path="/errors" element={<Layout><ErrorLog /></Layout>} />
        <Route path="/phrases" element={<Layout><PhraseBank /></Layout>} />
        <Route path="/progress" element={<Layout><Progress /></Layout>} />
      </Routes>
    </HashRouter>
  )
}
