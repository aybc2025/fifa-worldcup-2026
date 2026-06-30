import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { AnimatePresence } from 'framer-motion'

import { queryClient } from './config/queryClient'
import './config/i18n'

import { TopBar } from './components/layout/TopBar'
import { BottomNav } from './components/layout/BottomNav'
import { OfflineBanner, LoadingSpinner } from './components/common/index'
import { useOnlineStatus } from './hooks/index'

const HomePage       = lazy(() => import('./pages/HomePage'))
const MatchPage      = lazy(() => import('./pages/MatchPage'))
const GroupsPage     = lazy(() => import('./pages/GroupsPage'))
const KnockoutPage   = lazy(() => import('./pages/KnockoutPage'))
const TeamsPage      = lazy(() => import('./pages/TeamsPage'))
const TeamDetailPage = lazy(() => import('./pages/TeamDetailPage'))
const TopScorersPage = lazy(() => import('./pages/TopScorersPage'))

function AppShell() {
  const { i18n } = useTranslation()
  const online = useOnlineStatus()

  useEffect(() => {
    const lang = i18n.language?.startsWith('he') ? 'he' : 'en'
    document.documentElement.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr')
    document.documentElement.setAttribute('lang', lang)
  }, [i18n.language])

  return (
    <div className="min-h-screen bg-bg text-text font-body">
      <TopBar />
      <AnimatePresence>
        {!online && <OfflineBanner key="offline" />}
      </AnimatePresence>
      <main className="max-w-lg mx-auto">
        <Suspense fallback={<LoadingSpinner size="lg" />}>
          <Routes>
            <Route path="/"           element={<HomePage />} />
            <Route path="/match/:id"  element={<MatchPage />} />
            <Route path="/groups"     element={<GroupsPage />} />
            <Route path="/knockout"   element={<KnockoutPage />} />
            <Route path="/teams"      element={<TeamsPage />} />
            <Route path="/team/:id"   element={<TeamDetailPage />} />
            <Route path="/scorers"    element={<TopScorersPage />} />
          </Routes>
        </Suspense>
      </main>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AppShell />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
