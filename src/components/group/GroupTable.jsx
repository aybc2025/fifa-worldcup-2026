import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FLAG_URL, COUNTRY_CODES } from '../../config/constants'

function QualificationDot({ rank }) {
  // Top 2 qualify automatically; 3rd may qualify as best third-placed
  if (rank <= 2) return <span className="w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0" />
  if (rank === 3) return <span className="w-1.5 h-1.5 rounded-full bg-amber flex-shrink-0" />
  return <span className="w-1.5 h-1.5 rounded-full bg-border flex-shrink-0" />
}

export function GroupTable({ standing, groupLetter, delay = 0 }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  if (!standing?.length) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-surface border border-border rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface2 border-b border-border">
        <span className="text-xs font-bold text-teal tracking-widest uppercase">
          {t('common.group')} {groupLetter}
        </span>
        <div className="flex gap-4 text-[10px] text-muted font-medium">
          <span className="w-4 text-center">{t('groups.played')}</span>
          <span className="w-4 text-center">{t('groups.won')}</span>
          <span className="w-4 text-center">{t('groups.drawn')}</span>
          <span className="w-4 text-center">{t('groups.lost')}</span>
          <span className="w-6 text-center">{t('groups.gd')}</span>
          <span className="w-6 text-center font-bold">{t('groups.points')}</span>
        </div>
      </div>

      {/* Rows */}
      {standing.map((entry, i) => {
        const cc = COUNTRY_CODES[entry.team?.name]
        return (
          <button
            key={entry.team?.id}
            onClick={() => navigate(`/team/${entry.team?.id}`)}
            className="w-full flex items-center gap-3 px-4 py-2.5 border-b border-border/50 last:border-0 hover:bg-surface2 transition-colors text-sm"
          >
            <QualificationDot rank={i + 1} />
            <span className="w-5 text-[11px] text-muted text-center">{i + 1}</span>

            {cc && (
              <img
                src={FLAG_URL(cc)}
                alt={entry.team?.name}
                className="w-6 h-4 object-cover rounded-sm flex-shrink-0"
                loading="lazy"
              />
            )}

            <span className="flex-1 text-start text-xs font-medium truncate">
              {entry.team?.name}
            </span>

            <div className="flex gap-4 text-[11px] text-muted">
              <span className="w-4 text-center">{entry.all?.played ?? 0}</span>
              <span className="w-4 text-center">{entry.all?.win ?? 0}</span>
              <span className="w-4 text-center">{entry.all?.draw ?? 0}</span>
              <span className="w-4 text-center">{entry.all?.lose ?? 0}</span>
              <span className="w-6 text-center">{entry.goalsDiff >= 0 ? '+' : ''}{entry.goalsDiff ?? 0}</span>
              <span className="w-6 text-center font-bold text-text">{entry.points ?? 0}</span>
            </div>
          </button>
        )
      })}
    </motion.div>
  )
}
