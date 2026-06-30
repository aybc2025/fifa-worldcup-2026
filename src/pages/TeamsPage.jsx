import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useTeams, useFavoriteTeams } from '../hooks/index'
import { useAllFixtures } from '../hooks/useMatches'
import { LoadingSpinner, ErrorState } from '../components/common/index'
import { FLAG_URL, COUNTRY_CODES } from '../config/constants'

export default function TeamsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isFavorite, toggle } = useFavoriteTeams()
  const [search, setSearch] = useState('')

  // Try dedicated teams endpoint first, fall back to deriving from fixtures
  const { teams: apiTeams, isLoading: teamsLoading, isError: teamsError } = useTeams()
  const { fixtures, isLoading: fixturesLoading } = useAllFixtures()

  const isLoading = teamsLoading && fixturesLoading

  // Derive teams from fixtures if dedicated endpoint fails or returns nothing
  let teams = apiTeams
  if (!teams.length && fixtures.length) {
    const map = {}
    for (const f of fixtures) {
      const home = f.home_team || f.teams?.home
      const away = f.away_team || f.teams?.away
      const hName = typeof home === 'string' ? home : home?.name
      const aName = typeof away === 'string' ? away : away?.name
      const hId = typeof home === 'object' ? home?.id : hName
      const aId = typeof away === 'object' ? away?.id : aName
      if (hName) map[hId ?? hName] = { id: hId ?? hName, name: hName }
      if (aName) map[aId ?? aName] = { id: aId ?? aName, name: aName }
    }
    teams = Object.values(map)
  }

  const filtered = teams
    .filter((t_) => t_.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))

  if (isLoading) return <LoadingSpinner size="lg" />

  return (
    <div className="pb-24">
      <div className="px-4 pt-4 mb-3">
        <h1 className="text-lg font-bold text-teal mb-3">{t('teams.title')}</h1>
        <input
          type="search"
          placeholder={t('teams.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:border-teal/50 transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 px-4">
        {filtered.map((team, i) => {
          const cc = COUNTRY_CODES[team.name]
          const fav = isFavorite(team.id)
          return (
            <motion.button
              key={team.id ?? i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.015 }}
              onClick={() => navigate(`/team/${encodeURIComponent(team.id ?? team.name)}`)}
              className="bg-surface border border-border rounded-xl p-3 flex flex-col items-center gap-2 hover:border-teal/30 transition-colors relative"
            >
              {cc ? (
                <img src={FLAG_URL(cc)} alt={team.name} className="w-14 h-10 object-cover rounded" loading="lazy" />
              ) : (
                <div className="w-14 h-10 rounded bg-surface2 flex items-center justify-center text-xl">🏳️</div>
              )}
              <span className="text-xs font-semibold text-center leading-tight">{team.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); toggle(team.id) }}
                className="absolute top-2 right-2 text-sm"
              >
                {fav ? '⭐' : '☆'}
              </button>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
