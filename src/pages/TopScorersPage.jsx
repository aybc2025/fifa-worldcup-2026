import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useAllFixtures } from '../hooks/useMatches'
import { useTopScorers } from '../hooks/index'
import { LoadingSpinner, EmptyState } from '../components/common/index'
import { FLAG_URL, COUNTRY_CODES } from '../config/constants'

export default function TopScorersPage() {
  const { t } = useTranslation()
  const { fixtures, isLoading } = useAllFixtures()
  const scorers = useTopScorers(fixtures)

  if (isLoading) return <LoadingSpinner size="lg" />

  return (
    <div className="pb-24">
      <div className="px-4 pt-4 mb-4">
        <h1 className="text-lg font-bold text-teal">{t('scorers.title')}</h1>
      </div>

      {scorers.length === 0 ? (
        <EmptyState message="Goal data will appear once matches begin" />
      ) : (
        <div className="px-4 space-y-2">
          {scorers.map(({ player, team, goals, penalties }, i) => {
            const teamName = typeof team === 'string' ? team : team?.name
            const cc = COUNTRY_CODES[teamName]
            return (
              <motion.div
                key={player?.id || player?.name || i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-surface border border-border rounded-xl px-4 py-3 flex items-center gap-3"
              >
                <span className={`w-7 text-center font-bold font-display text-lg ${
                  i === 0 ? 'text-amber' : i <= 2 ? 'text-teal' : 'text-muted'
                }`}>
                  {i + 1}
                </span>

                {cc && <img src={FLAG_URL(cc)} alt={teamName} className="w-8 h-6 object-cover rounded-sm" loading="lazy" />}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{player?.name}</p>
                  <p className="text-[11px] text-muted truncate">{teamName}</p>
                </div>

                <div className="flex gap-4 text-center text-xs">
                  <div>
                    <div className="font-bold text-teal font-display text-lg leading-tight">{goals}</div>
                    <div className="text-[10px] text-muted">{t('scorers.goals')}</div>
                  </div>
                  {penalties > 0 && (
                    <div>
                      <div className="font-bold text-muted font-display text-base leading-tight">{penalties}</div>
                      <div className="text-[10px] text-muted">{t('scorers.penalty')}</div>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
