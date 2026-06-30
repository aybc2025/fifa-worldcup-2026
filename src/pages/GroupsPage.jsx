import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGroups } from '../hooks/index'
import { useAllFixtures } from '../hooks/useMatches'
import { MatchCard } from '../components/match/MatchCard'
import { LoadingSpinner, ErrorState } from '../components/common/index'
import { FLAG_URL, COUNTRY_CODES } from '../config/constants'

function QualDot({ rank }) {
  if (rank <= 2) return <span className="w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0" />
  if (rank === 3) return <span className="w-1.5 h-1.5 rounded-full bg-amber flex-shrink-0" />
  return <span className="w-1.5 h-1.5 rounded-full bg-border flex-shrink-0" />
}

function GroupTable({ group }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const letter = group.name
  const rows = group.teams || []

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface2 border-b border-border">
        <span className="text-xs font-bold text-teal tracking-widest uppercase">
          {t('common.group')} {letter}
        </span>
        <div className="flex gap-3 text-[10px] text-muted font-medium">
          <span className="w-4 text-center">P</span>
          <span className="w-4 text-center">W</span>
          <span className="w-4 text-center">D</span>
          <span className="w-4 text-center">L</span>
          <span className="w-6 text-center">GD</span>
          <span className="w-6 text-center font-bold">Pts</span>
        </div>
      </div>

      {rows.map((entry, i) => {
        const name = entry.team?.name || '?'
        const cc = COUNTRY_CODES[name]
        const teamId = entry.team?.id

        return (
          <button
            key={i}
            onClick={() => teamId && navigate(`/team/${teamId}`)}
            className="w-full flex items-center gap-2 px-4 py-2.5 border-b border-border/50 last:border-0 hover:bg-surface2 transition-colors text-sm"
          >
            <QualDot rank={i + 1} />
            <span className="w-4 text-[11px] text-muted text-center">{i + 1}</span>
            {cc
              ? <img src={FLAG_URL(cc)} alt={name} className="w-6 h-4 object-cover rounded-sm flex-shrink-0" loading="lazy" />
              : <span className="w-6 h-4 flex-shrink-0" />
            }
            <span className="flex-1 text-start text-xs font-medium truncate">{name}</span>
            <div className="flex gap-3 text-[11px] text-muted">
              <span className="w-4 text-center">{entry.played}</span>
              <span className="w-4 text-center">{entry.w}</span>
              <span className="w-4 text-center">{entry.d}</span>
              <span className="w-4 text-center">{entry.l}</span>
              <span className="w-6 text-center">{entry.gd >= 0 ? '+' : ''}{entry.gd}</span>
              <span className="w-6 text-center font-bold text-text">{entry.points}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default function GroupsPage() {
  const { t } = useTranslation()
  const { groups, isLoading, isError, refetch } = useGroups()
  const { fixtures } = useAllFixtures()
  const [activeIdx, setActiveIdx] = useState(0)

  if (isLoading) return <LoadingSpinner size="lg" />
  if (isError) return <ErrorState onRetry={refetch} />

  const activeGroup = groups[activeIdx]
  const groupMatches = activeGroup
    ? fixtures
        .filter((f) => f._group === activeGroup.name)
        .sort((a, b) => a.fixture.date.localeCompare(b.fixture.date))
    : []

  return (
    <div className="pb-24">
      <div className="px-4 pt-4 mb-4">
        <h1 className="text-lg font-bold text-teal">{t('groups.title')}</h1>
      </div>

      {/* Group selector */}
      <div className="flex gap-1.5 px-4 mb-4 overflow-x-auto pb-1">
        {groups.map((g, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className={`flex-shrink-0 w-9 h-9 rounded-lg text-sm font-bold transition-all ${
              activeIdx === i
                ? 'bg-teal/20 text-teal border border-teal/50'
                : 'bg-surface text-muted border border-border hover:border-teal/20'
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      <motion.div
        key={activeIdx}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="px-4 space-y-3"
      >
        {/* Standings */}
        {activeGroup && <GroupTable group={activeGroup} />}

        {/* Legend */}
        <div className="flex gap-4 text-[11px] text-muted px-1">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal" /> {t('groups.qualified')}</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber" /> Best 3rd</span>
        </div>

        {/* Group matches */}
        {groupMatches.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-[11px] font-semibold text-muted tracking-widest uppercase px-1 pt-1">
              Matches
            </h2>
            {groupMatches.map((f, i) => (
              <MatchCard key={f.fixture?.id ?? i} fixture={f} animDelay={i * 0.04} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
