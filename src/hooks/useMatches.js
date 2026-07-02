import { useQuery } from '@tanstack/react-query'
import { fetchAllFixtures } from '../services/apiClient'
import { TTL, POLL } from '../config/constants'

// Stable numeric ID from a team name string
function teamId(name) {
  if (!name) return 0
  let h = 0
  for (const c of name) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0
  return h
}

// Openfootball time is "HH:MM UTC±X" e.g. "20:00 UTC-5"
// Convert to a proper UTC ISO string so slice(0,10) gives the UTC date.
function matchToUTC(date, time) {
  if (!time) return new Date(date + 'T12:00:00Z').toISOString()
  const m = time.match(/^(\d{2}:\d{2})\s+UTC([+-]\d{1,2})$/)
  if (!m) return new Date(date + 'T12:00:00Z').toISOString()
  const [, hhmm, offsetStr] = m
  const offset = parseInt(offsetStr, 10)
  const sign = offset >= 0 ? '+' : '-'
  const tz = `${sign}${String(Math.abs(offset)).padStart(2, '0')}:00`
  try {
    return new Date(`${date}T${hhmm}:00${tz}`).toISOString()
  } catch {
    return new Date(date + 'T12:00:00Z').toISOString()
  }
}

export function normalizeMatch(m, idx) {
  const dateStr = matchToUTC(m.date, m.time)
  const ftScore = m.score?.ft
  const etScore = m.score?.et
  const penScore = m.score?.p
  const hasScore = Array.isArray(ftScore)
  const hasET = Array.isArray(etScore)
  const hasPen = Array.isArray(penScore)

  const homeName = typeof m.team1 === 'string' ? m.team1 : (m.team1?.name ?? 'TBD')
  const awayName = typeof m.team2 === 'string' ? m.team2 : (m.team2?.name ?? 'TBD')
  const homeCode = typeof m.team1 === 'object' ? (m.team1?.code ?? null) : null
  const awayCode = typeof m.team2 === 'object' ? (m.team2?.code ?? null) : null
  const homeId = teamId(homeName)
  const awayId = teamId(awayName)

  // Use ET score when available (includes extra-time goals); fall back to FT
  const displayScore = hasET ? etScore : ftScore
  const homeGoals = displayScore ? displayScore[0] : null
  const awayGoals = displayScore ? displayScore[1] : null
  const homePen = hasPen ? penScore[0] : null
  const awayPen = hasPen ? penScore[1] : null

  const events = [
    ...(m.goals1 ?? []).map((g) => ({
      team: { id: homeId, name: homeName },
      player: { name: g.name },
      minute: g.minute,
      type: 'Goal',
      detail: g.penalty ? 'Penalty' : g.owngoal ? 'Own Goal' : 'Normal Goal',
    })),
    ...(m.goals2 ?? []).map((g) => ({
      team: { id: awayId, name: awayName },
      player: { name: g.name },
      minute: g.minute,
      type: 'Goal',
      detail: g.penalty ? 'Penalty' : g.owngoal ? 'Own Goal' : 'Normal Goal',
    })),
  ]

  return {
    fixture: {
      id: m.num ?? idx + 1,
      date: dateStr,
      localDate: m.date ?? dateStr.slice(0, 10),
      status: {
        short: hasScore ? (hasPen ? 'PEN' : hasET ? 'AET' : 'FT') : 'NS',
        long: hasScore ? (hasPen ? 'Penalties' : hasET ? 'After Extra Time' : 'Match Finished') : 'Not Started',
      },
      venue: m.ground ? { name: m.ground.name, city: m.ground.city } : null,
    },
    league: { round: m.round ?? '' },
    teams: {
      home: { id: homeId, name: homeName, code: homeCode },
      away: { id: awayId, name: awayName, code: awayCode },
    },
    goals: { home: homeGoals, away: awayGoals },
    score: {
      halftime: { home: m.score?.ht?.[0] ?? null, away: m.score?.ht?.[1] ?? null },
      fulltime: { home: homeGoals, away: awayGoals },
      penalty: { home: homePen, away: awayPen },
    },
    events,
    _group: m.group ? String(m.group).replace(/^group\s*/i, '').toUpperCase() : null,
  }
}

// Used by useMatch.js which still calls normalizeFixtures on raw query data
export function normalizeFixtures(data) {
  if (!data) return []
  const raw = Array.isArray(data.matches) ? data.matches : []
  return raw.map(normalizeMatch)
}

export function useAllFixtures() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['fixtures', 'all'],
    queryFn: fetchAllFixtures,
    staleTime: TTL.FIXTURES_ALL,
    refetchInterval: POLL.IDLE,
    refetchIntervalInBackground: false,
    retry: 2,
  })

  const fixtures = normalizeFixtures(data)

  return { fixtures, isLoading, isError, error, refetch }
}
