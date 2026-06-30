import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useTeam, useFavoriteTeams } from '../hooks/index'
import { LoadingSpinner, ErrorState, EmptyState } from '../components/common/index'
import { FLAG_URL, COUNTRY_CODES } from '../config/constants'

const POS_ORDER = ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker', 'Forward']
const POS_ICON = { Goalkeeper: '🧤', Defender: '🛡️', Midfielder: '⚙️', Attacker: '⚽', Forward: '⚽' }

export default function TeamDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { team, players, isLoading, isError } = useTeam(decodeURIComponent(id))
  const { isFavorite, toggle } = useFavoriteTeams()

  if (isLoading) return <LoadingSpinner size="lg" />
  if (isError || !team) return <ErrorState />

  const name = team.name || team.team || id
  const cc = COUNTRY_CODES[name]
  const fav = isFavorite(team.id || id)

  // Group by position
  const byPos = {}
  for (const p of players) {
    const pos = p.position || p.pos || 'Squad'
    if (!byPos[pos]) byPos[pos] = []
    byPos[pos].push(p)
  }

  const posKeys = [...POS_ORDER, ...Object.keys(byPos).filter((k) => !POS_ORDER.includes(k))]

  return (
    <div className="pb-24">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-4 py-3 text-muted hover:text-teal text-sm transition-colors">
        ←
      </button>

      {/* Hero */}
      <div className="mx-4 bg-surface2 border border-border rounded-2xl p-5 text-center mb-4">
        {cc ? (
          <img src={FLAG_URL(cc)} alt={name} className="w-20 h-14 object-cover rounded-lg mx-auto mb-3" />
        ) : (
          <div className="w-20 h-14 rounded-lg bg-surface mx-auto mb-3 flex items-center justify-center text-3xl">🏳️</div>
        )}
        <h1 className="text-xl font-bold text-teal mb-1">{name}</h1>
        {team.group && <p className="text-xs text-muted mb-2">{t('common.group')} {team.group}</p>}
        <button
          onClick={() => toggle(team.id || id)}
          className="text-sm text-muted hover:text-amber transition-colors"
        >
          {fav ? `⭐ ${t('teams.removeFavorite')}` : `☆ ${t('teams.addFavorite')}`}
        </button>
      </div>

      {/* Squad */}
      <div className="px-4">
        {players.length === 0 ? (
          <EmptyState message="Squad data not yet available" />
        ) : (
          <>
            <h2 className="text-xs font-bold text-muted tracking-widest uppercase mb-3">
              {t('teams.squad')} — {players.length} {t('teams.players')}
            </h2>
            <div className="space-y-4">
              {posKeys.map((pos) => {
                const group = byPos[pos]
                if (!group?.length) return null
                return (
                  <div key={pos}>
                    <div className="flex items-center gap-2 mb-2">
                      <span>{POS_ICON[pos] ?? '👤'}</span>
                      <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">{pos}</span>
                    </div>
                    <div className="space-y-1.5">
                      {group.map((player, i) => (
                        <motion.div
                          key={player.id || i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.025 }}
                          className="bg-surface border border-border rounded-xl px-3 py-2.5 flex items-center gap-3"
                        >
                          <span className="w-6 text-center text-[11px] font-mono text-muted">
                            {player.number ?? player.shirt_number ?? '—'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{player.name}</p>
                            {(player.club || player.team) && (
                              <p className="text-[11px] text-muted truncate">{player.club || player.team}</p>
                            )}
                          </div>
                          {player.age && <span className="text-[11px] text-muted">{player.age}</span>}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
