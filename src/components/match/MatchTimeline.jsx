import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

const EVENT_ICONS = {
  Goal: '⚽',
  'Own Goal': '🥅',
  Penalty: '🎯',
  'Missed Penalty': '❌',
  Card: null, // handled by detail
  subst: '🔄',
}

function CardIcon({ detail }) {
  if (detail?.includes('Yellow')) return <span className="text-amber text-base">🟨</span>
  if (detail?.includes('Red')) return <span className="text-red text-base">🟥</span>
  return <span>📋</span>
}

function EventRow({ event, isHome, index }) {
  const { t } = useTranslation()
  const { time, team, player, assist, type, detail } = event

  const icon = type === 'Card'
    ? <CardIcon detail={detail} />
    : <span className="text-base">{EVENT_ICONS[type] ?? EVENT_ICONS[detail] ?? '•'}</span>

  const label = type === 'subst'
    ? `${player?.name} → ${assist?.name}`
    : player?.name

  const sublabel = type === 'Goal' && detail === 'Penalty'
    ? `(${t('match.penalty')})`
    : type === 'Goal' && detail === 'Own Goal'
    ? `(${t('match.ownGoal')})`
    : type === 'subst'
    ? null
    : assist?.name
    ? `↳ ${assist.name}`
    : null

  return (
    <motion.div
      initial={{ opacity: 0, x: isHome ? -10 : 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`flex items-start gap-3 py-2 ${isHome ? 'flex-row' : 'flex-row-reverse'}`}
    >
      {/* Time */}
      <span className="text-[11px] text-muted min-w-[32px] text-center pt-0.5 font-mono">
        {time?.elapsed}'
      </span>

      {/* Icon */}
      <div className="mt-0.5">{icon}</div>

      {/* Text */}
      <div className={`flex flex-col ${isHome ? 'text-start' : 'text-end'} flex-1`}>
        <span className="text-sm font-medium leading-tight">{label}</span>
        {sublabel && <span className="text-[11px] text-muted">{sublabel}</span>}
      </div>
    </motion.div>
  )
}

export function MatchTimeline({ events, homeTeamId }) {
  const { t } = useTranslation()

  if (!events?.length) {
    return <p className="text-center text-muted text-sm py-8">{t('match.noEvents')}</p>
  }

  return (
    <div className="divide-y divide-border">
      {events.map((ev, i) => (
        <EventRow
          key={i}
          event={ev}
          isHome={ev.team?.id === homeTeamId}
          index={i}
        />
      ))}
    </div>
  )
}
