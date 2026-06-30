import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useMatch } from '../hooks/useMatch'
import { MatchTimeline } from '../components/match/MatchTimeline'
import { MatchStats } from '../components/match/MatchStats'
import { LiveScoreBadge } from '../components/match/MatchCard'
import { LoadingSpinner, ErrorState, EmptyState } from '../components/common/index'
import { FLAG_URL, COUNTRY_CODES } from '../config/constants'

const TABS = ['events', 'stats', 'lineup']

function LineupGrid({ lineups }) {
  if (!lineups?.length) return <EmptyState message="Lineup not yet available" />
  return (
    <div className="grid grid-cols-2 gap-4 py-2">
      {lineups.map((side, i) => {
        const teamName = side.team?.name || (i === 0 ? 'Home' : 'Away')
        const starters = side.startXI || side.starting || []
        const subs = side.substitutes || side.bench || []
        return (
          <div key={i}>
            <p className="text-[11px] font-bold text-teal text-center mb-3 tracking-widest uppercase">{teamName}</p>
            <div className="space-y-1.5">
              {starters.map(({ player }, j) => (
                <div key={j} className="flex items-center gap-2 text-xs">
                  <span className="w-5 text-center text-muted font-mono text-[11px]">{player?.number ?? j + 1}</span>
                  <span className="truncate">{player?.name ?? player}</span>
                </div>
              ))}
            </div>
            {subs.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-[10px] text-muted mb-1.5">Subs</p>
                {subs.map(({ player }, j) => (
                  <div key={j} className="flex items-center gap-2 text-xs text-muted">
                    <span className="w-5 text-center font-mono text-[11px]">{player?.number}</span>
                    <span className="truncate">{player?.name ?? player}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function MatchPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [tab, setTab] = useState('events')
  const { fixture, lineups, events, stats, isLive, isLoading, isError } = useMatch(id)

  if (isLoading) return <LoadingSpinner size="lg" />
  if (isError || !fixture) return <ErrorState />

  const { teams, goals, league, fixture: fix } = fixture
  const status = fix?.status?.short
  const homeCC = COUNTRY_CODES[teams?.home?.name]
  const awayCC = COUNTRY_CODES[teams?.away?.name]
  const kickoff = fix?.date ? new Date(fix.date) : null
  const timeStr = kickoff?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ?? ''

  return (
    <div className="pb-24">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-4 py-3 text-muted hover:text-teal text-sm transition-colors">
        ← {league?.round}
      </button>

      {/* Hero */}
      <div className={`mx-4 rounded-2xl border overflow-hidden mb-4 ${
        isLive ? 'border-teal/30 shadow-[0_0_24px_rgba(0,206,201,0.1)]' : 'border-border'
      }`}>
        <div className="bg-surface2 px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col items-center gap-2 flex-1">
              {homeCC && <img src={FLAG_URL(homeCC)} alt={teams?.home?.name} className="w-14 h-10 object-cover rounded" />}
              <span className="text-sm font-bold text-center leading-tight">{teams?.home?.name}</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <span className="font-display text-5xl font-bold text-text">{goals?.home ?? '–'}</span>
                <span className="text-muted text-2xl">–</span>
                <span className="font-display text-5xl font-bold text-text">{goals?.away ?? '–'}</span>
              </div>
              {isLive
                ? <LiveScoreBadge elapsed={fix?.status?.elapsed} status={status} />
                : <span className="text-xs text-muted">{status === 'FT' ? t('match.fulltime') : timeStr}</span>
              }
            </div>

            <div className="flex flex-col items-center gap-2 flex-1">
              {awayCC && <img src={FLAG_URL(awayCC)} alt={teams?.away?.name} className="w-14 h-10 object-cover rounded" />}
              <span className="text-sm font-bold text-center leading-tight">{teams?.away?.name}</span>
            </div>
          </div>
        </div>
        <div className="px-4 py-2 border-t border-border text-center text-[11px] text-muted">
          {fix?.venue?.name}{fix?.venue?.city ? ` · ${fix.venue.city}` : ''}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mx-4 border border-border rounded-xl overflow-hidden mb-4">
        {TABS.map((tb) => (
          <button key={tb} onClick={() => setTab(tb)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
              tab === tb ? 'bg-teal/15 text-teal' : 'text-muted hover:text-text'
            }`}>
            {t(`match.${tb}`)}
          </button>
        ))}
      </div>

      <div className="mx-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {tab === 'events' && <MatchTimeline events={events} homeTeamId={teams?.home?.id} />}
            {tab === 'stats' && (stats.length ? <MatchStats stats={stats} /> : <EmptyState message="Stats not yet available" />)}
            {tab === 'lineup' && <LineupGrid lineups={lineups} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
