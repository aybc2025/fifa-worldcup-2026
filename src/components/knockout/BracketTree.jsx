import { useRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { BracketMatch } from './BracketMatch'

// Layout constants
const CARD_W = 140
const CARD_H = 66       // approx height of BracketMatch card
const COL_GAP = 56      // horizontal gap between rounds
const ROW_GAP = 18      // vertical gap between matches in same round

const ROUNDS_CONFIG = [
  { key: 'Round of 32',          labelKey: 'knockout.r32',    count: 16 },
  { key: 'Round of 16',          labelKey: 'knockout.r16',    count: 8  },
  { key: 'Quarter-finals',       labelKey: 'knockout.qf',     count: 4  },
  { key: 'Semi-finals',          labelKey: 'knockout.sf',     count: 2  },
  { key: 'Final',                labelKey: 'knockout.final',  count: 1  },
]

/**
 * Given n matches in a column with a known slot height,
 * returns the Y center of each match card.
 */
function calcCenters(count, slotH) {
  return Array.from({ length: count }, (_, i) => i * slotH + slotH / 2)
}

function ConnectorPath({ x1, y1, x2, y2, done }) {
  const mx = x1 + (x2 - x1) / 2
  const d = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`
  return (
    <path
      d={d}
      fill="none"
      stroke={done ? 'rgba(0,206,201,0.55)' : 'rgba(0,206,201,0.15)'}
      strokeWidth={done ? 1.5 : 1}
      strokeDasharray={done ? 'none' : '4 4'}
    />
  )
}

export function BracketTree({ rounds: roundsData }) {
  const { t } = useTranslation()
  const scrollRef = useRef(null)
  const [svgPaths, setSvgPaths] = useState([])

  // Max matches in first round defines the slot height for all rounds
  const maxCount = ROUNDS_CONFIG[0].count
  const slotH = CARD_H + ROW_GAP

  // Total canvas height (based on first round)
  const totalH = maxCount * slotH

  // Compute column x positions
  const colX = ROUNDS_CONFIG.map((_, i) => i * (CARD_W + COL_GAP))
  const totalW = colX[colX.length - 1] + CARD_W + 40 // padding right

  // Build SVG connector paths after layout is known
  useEffect(() => {
    const paths = []

    ROUNDS_CONFIG.forEach((round, colIdx) => {
      if (colIdx === 0) return // no connectors before first round
      const prevCount = ROUNDS_CONFIG[colIdx - 1].count
      const currCount = round.count

      const prevSlotH = totalH / prevCount
      const currSlotH = totalH / currCount

      const prevCenters = calcCenters(prevCount, prevSlotH)
      const currCenters = calcCenters(currCount, currSlotH)

      // Each current match connects from 2 previous matches
      currCenters.forEach((cy, matchIdx) => {
        const srcA = prevCenters[matchIdx * 2]
        const srcB = prevCenters[matchIdx * 2 + 1]

        const x1 = colX[colIdx - 1] + CARD_W
        const x2 = colX[colIdx]

        const prevFixtures = roundsData?.[ROUNDS_CONFIG[colIdx - 1].key] ?? []
        const DECIDED = new Set(['FT', 'AET', 'PEN', 'AWD', 'WO'])
        const doneA = DECIDED.has(prevFixtures[matchIdx * 2]?.fixture?.status?.short)
        const doneB = DECIDED.has(prevFixtures[matchIdx * 2 + 1]?.fixture?.status?.short)

        if (srcA !== undefined) {
          paths.push({ x1, y1: srcA, x2, y2: cy, done: doneA, key: `${colIdx}-${matchIdx}-a` })
        }
        if (srcB !== undefined) {
          paths.push({ x1, y1: srcB, x2, y2: cy, done: doneB, key: `${colIdx}-${matchIdx}-b` })
        }
      })
    })

    setSvgPaths(paths)
  }, [roundsData, totalH]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative">
      {/* Swipe hint */}
      <p className="text-center text-[11px] text-muted/60 py-2">
        {t('knockout.swipeHint')}
      </p>

      {/* Scrollable bracket */}
      <div
        ref={scrollRef}
        className="overflow-x-auto pb-6"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="relative" style={{ width: totalW, height: totalH + 48 }}>

          {/* SVG connector layer */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={totalW}
            height={totalH + 48}
            style={{ overflow: 'visible' }}
          >
            {svgPaths.map(({ x1, y1, x2, y2, done, key }) => (
              <ConnectorPath key={key} x1={x1} y1={y1 + 24} x2={x2} y2={y2 + 24} done={done} />
            ))}
          </svg>

          {/* Round columns */}
          {ROUNDS_CONFIG.map((round, colIdx) => {
            const fixtures = roundsData?.[round.key] ?? []
            const currSlotH = totalH / round.count
            const centers = calcCenters(round.count, currSlotH)

            return (
              <div key={round.key} className="absolute top-0" style={{ left: colX[colIdx] }}>
                {/* Round label */}
                <div
                  className="text-center text-[9px] font-semibold tracking-widest uppercase text-teal/70 mb-2 pb-1 border-b border-teal/10"
                  style={{ width: CARD_W }}
                >
                  {t(round.labelKey)}
                </div>

                {/* Match cards */}
                {Array.from({ length: round.count }, (_, matchIdx) => {
                  const fixture = fixtures[matchIdx] ?? null
                  const cy = centers[matchIdx] + 24 // +24 for label

                  return (
                    <div
                      key={matchIdx}
                      className="absolute"
                      style={{
                        top: cy - CARD_H / 2,
                        left: 0,
                        width: CARD_W,
                      }}
                    >
                      <BracketMatch
                        fixture={fixture}
                        index={colIdx * round.count + matchIdx}
                      />
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
