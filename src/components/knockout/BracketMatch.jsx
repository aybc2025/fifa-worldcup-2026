import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { FLAG_URL, COUNTRY_CODES } from '../../config/constants'

const FINISHED = new Set(['FT', 'AET', 'PEN', 'AWD', 'WO'])

function TeamRow({ team, score, isWinner, isFinished, penScore }) {
  const cc = team ? COUNTRY_CODES[team.name] : null
  const isTbd = !team

  return (
    <div className={`flex items-center gap-2 py-1.5 px-2.5 transition-opacity ${
      isFinished && !isWinner ? 'opacity-30' : ''
    }`}>
      {cc ? (
        <img
          src={FLAG_URL(cc)}
          alt={team.name}
          className="w-6 h-4 object-cover rounded-sm flex-shrink-0"
          loading="lazy"
        />
      ) : (
        <span className="w-6 h-4 rounded-sm bg-border/40 flex-shrink-0" />
      )}

      <span className={`text-[11px] flex-1 leading-tight truncate max-w-[80px] ${
        isWinner ? 'text-text font-bold' : isTbd ? 'text-muted/40 italic' : 'text-muted'
      }`}>
        {team?.name ?? '?'}
      </span>

      <span className={`text-[11px] font-mono font-bold text-center ${
        isWinner ? 'text-teal' : 'text-muted'
      }`}>
        {isFinished ? (score ?? 0) : ''}
        {isFinished && penScore != null ? (
          <span className="text-[9px] font-normal ml-0.5 opacity-70">({penScore})</span>
        ) : null}
      </span>
    </div>
  )
}

export function BracketMatch({ fixture, index = 0 }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const isFinished = fixture && FINISHED.has(fixture.fixture?.status?.short)
  const isLive = fixture && ['1H', '2H', 'HT', 'ET', 'P', 'BT'].includes(
    fixture.fixture?.status?.short
  )

  const penHome = fixture?.score?.penalty?.home
  const penAway = fixture?.score?.penalty?.away
  const wentToPen = penHome != null && penAway != null

  const homeWon = isFinished && (
    wentToPen ? penHome > penAway : (fixture.goals?.home ?? 0) > (fixture.goals?.away ?? 0)
  )
  const awayWon = isFinished && (
    wentToPen ? penAway > penHome : (fixture.goals?.away ?? 0) > (fixture.goals?.home ?? 0)
  )

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      whileHover={{ scale: 1.03 }}
      onClick={() => fixture && navigate(`/match/${fixture.fixture?.id}`)}
      className={`
        w-[140px] rounded-lg border overflow-hidden cursor-pointer select-none
        transition-shadow duration-200
        ${isLive
          ? 'border-teal/50 shadow-[0_0_16px_rgba(0,206,201,0.15)]'
          : isFinished
          ? 'border-border/70'
          : 'border-border border-dashed opacity-60'
        }
        bg-surface hover:border-teal/40
      `}
    >
      {isLive && (
        <div className="flex items-center gap-1 px-2.5 py-1 bg-red/10 border-b border-red/20">
          <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse-dot" />
          <span className="text-[9px] text-red font-medium">
            {fixture.fixture?.status?.elapsed}'
          </span>
        </div>
      )}

      <div className="divide-y divide-border/50">
        <TeamRow
          team={fixture?.teams?.home}
          score={fixture?.goals?.home}
          isWinner={homeWon}
          isFinished={isFinished}
          penScore={wentToPen ? penHome : null}
        />
        <TeamRow
          team={fixture?.teams?.away}
          score={fixture?.goals?.away}
          isWinner={awayWon}
          isFinished={isFinished}
          penScore={wentToPen ? penAway : null}
        />
      </div>

      {!fixture && (
        <div className="px-2.5 py-2 text-center text-[9px] text-muted/40 italic">
          {t('knockout.tbd')}
        </div>
      )}
    </motion.div>
  )
}
