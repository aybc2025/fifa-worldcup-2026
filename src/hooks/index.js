import { useQuery } from '@tanstack/react-query'
import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchTeamsData, fetchSquads } from '../services/apiClient'
import { useAllFixtures } from './useMatches'
import { TTL } from '../config/constants'
import { FLAG_URL, COUNTRY_CODES } from '../config/constants'

// ── Groups / Standings — computed from fixtures ───────────

export function useGroups() {
  const { fixtures, isLoading, isError, error, refetch } = useAllFixtures()

  const groupMap = {}

  for (const f of fixtures) {
    if (!f._group) continue
    const g = f._group
    if (!groupMap[g]) groupMap[g] = {}

    // Register both teams even if no result yet
    for (const side of ['home', 'away']) {
      const team = f.teams[side]
      if (team.id && !groupMap[g][team.id]) {
        groupMap[g][team.id] = {
          team,
          played: 0, w: 0, d: 0, l: 0,
          gf: 0, ga: 0, gd: 0, points: 0,
        }
      }
    }

    // Apply result for completed matches only
    const hg = f.goals.home
    const ag = f.goals.away
    if (hg === null || ag === null) continue

    const hs = groupMap[g][f.teams.home.id]
    const as_ = groupMap[g][f.teams.away.id]
    hs.played++; as_.played++
    hs.gf += hg; hs.ga += ag; hs.gd = hs.gf - hs.ga
    as_.gf += ag; as_.ga += hg; as_.gd = as_.gf - as_.ga

    if (hg > ag)      { hs.w++;  hs.points += 3; as_.l++ }
    else if (hg < ag) { as_.w++; as_.points += 3; hs.l++ }
    else              { hs.d++;  hs.points++;     as_.d++; as_.points++ }
  }

  const groups = Object.entries(groupMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, teams]) => ({
      name,
      teams: Object.values(teams).sort(
        (a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf
      ),
    }))

  return { groups, isLoading, isError, error, refetch }
}

// ── Knockout — derived from fixtures ─────────────────────

const KNOCKOUT_LABELS = {
  'Round of 32': 'Round of 32',
  'Round of 16': 'Round of 16',
  'Quarter-final': 'Quarter-finals',
  'Quarter-finals': 'Quarter-finals',
  'Semi-final': 'Semi-finals',
  'Semi-finals': 'Semi-finals',
  '3rd Place': '3rd Place Play-off',
  'Third Place': '3rd Place Play-off',
  'Final': 'Final',
}

// Bracket-order for each round (pairs must align with the next round's slots)
const BRACKET_ORDER = {
  'Round of 32': [74, 77, 73, 75, 83, 84, 81, 82, 76, 78, 79, 80, 86, 88, 85, 87],
  'Round of 16': [89, 90, 93, 94, 91, 92, 95, 96],
}

// Which two previous-round match IDs feed each next-round match (home, away)
const FEEDS_FROM = {
  89: [74, 77], 90: [73, 75], 91: [76, 78], 92: [79, 80],
  93: [83, 84], 94: [81, 82], 95: [86, 88], 96: [85, 87],
  97: [89, 90], 98: [93, 94], 99: [91, 92], 100: [95, 96],
  101: [97, 98], 102: [99, 100],
  103: [101, 102], // 3rd place: losers
  104: [101, 102], // Final: winners
}

function bracketSort(fixtures, round) {
  const order = BRACKET_ORDER[round]
  if (!order) return fixtures.sort((a, b) => (a.fixture.id ?? 0) - (b.fixture.id ?? 0))
  return fixtures.sort((a, b) => {
    const ai = order.indexOf(a.fixture.id)
    const bi = order.indexOf(b.fixture.id)
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
  })
}

function isDecided(f) {
  return ['FT', 'AET', 'PEN', 'AWD', 'WO'].includes(f?.fixture?.status?.short)
}

function getWinner(f, wantLoser = false) {
  if (!f || !isDecided(f)) return null
  const hp = f.score?.penalty?.home
  const ap = f.score?.penalty?.away
  const wentToPen = hp != null && ap != null
  const homeScore = wentToPen ? hp : (f.goals?.home ?? 0)
  const awayScore = wentToPen ? ap : (f.goals?.away ?? 0)
  if (homeScore === awayScore) return null
  const homeWon = homeScore > awayScore
  return wantLoser
    ? (homeWon ? f.teams.away : f.teams.home)
    : (homeWon ? f.teams.home : f.teams.away)
}

function isPlaceholder(name) {
  return /^[WL]\d+$/.test(name ?? '')
}

export function useKnockout(allFixtures = []) {
  const rounds = {}
  const byId = new Map()

  for (const f of allFixtures) {
    const raw = f.league?.round ?? ''
    const canonical = Object.entries(KNOCKOUT_LABELS).find(([k]) =>
      raw.toLowerCase().includes(k.toLowerCase())
    )?.[1]

    if (!canonical) continue
    if (!rounds[canonical]) rounds[canonical] = []
    rounds[canonical].push(f)
    byId.set(f.fixture.id, f)
  }

  for (const key of Object.keys(rounds)) {
    bracketSort(rounds[key], key)
  }

  // Replace placeholder team names (W74, W75, etc.) with actual winners
  for (const fixtures of Object.values(rounds)) {
    for (const f of fixtures) {
      const feeds = FEEDS_FROM[f.fixture.id]
      if (!feeds) continue
      const wantLoser = f.fixture.id === 103
      const [feedHome, feedAway] = feeds
      if (isPlaceholder(f.teams.home.name)) {
        const winner = getWinner(byId.get(feedHome), wantLoser)
        if (winner) f.teams.home = winner
      }
      if (isPlaceholder(f.teams.away.name)) {
        const winner = getWinner(byId.get(feedAway), wantLoser)
        if (winner) f.teams.away = winner
      }
    }
  }

  return { rounds }
}

// ── Teams — extracted from group stage fixtures only ──────

export function useTeams() {
  const { fixtures, isLoading, isError } = useAllFixtures()

  const teamsMap = {}
  for (const f of fixtures) {
    if (!f._group) continue  // knockout fixtures have TBD names like "1A", "2B"
    for (const side of ['home', 'away']) {
      const t = f.teams[side]
      if (t.id && !teamsMap[t.id]) teamsMap[t.id] = t
    }
  }

  return { teams: Object.values(teamsMap), isLoading, isError }
}

export function useTeam(id) {
  const { teams, isLoading, isError } = useTeams()
  const team = teams.find((t) => String(t.id) === String(id)) ?? null

  const { data: squads } = useQuery({
    queryKey: ['squads'],
    queryFn: fetchSquads,
    staleTime: Infinity,
  })

  const players = squads && team ? (squads[team.name] ?? []) : []

  return { team, players, isLoading, isError }
}

// ── Top Scorers — derived from fixture goal events ────────

export function useTopScorers(allFixtures = []) {
  const scorerMap = {}

  for (const f of allFixtures) {
    for (const ev of (f.events ?? [])) {
      if (ev.type !== 'Goal') continue
      if (ev.detail === 'Own Goal') continue
      const key = ev.player?.name
      if (!key) continue
      if (!scorerMap[key]) {
        scorerMap[key] = { player: ev.player, team: ev.team, goals: 0, penalties: 0 }
      }
      scorerMap[key].goals++
      if (ev.detail === 'Penalty') scorerMap[key].penalties++
    }
  }

  return Object.values(scorerMap).sort((a, b) => b.goals - a.goals)
}

// ── Favourite Teams ───────────────────────────────────────

const FAV_KEY = 'wc2026_favorites'

export function useFavoriteTeams() {
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem(FAV_KEY) ?? '[]') }
    catch { return [] }
  })

  const toggle = useCallback((teamId) => {
    setFavorites((prev) => {
      const next = prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
      localStorage.setItem(FAV_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isFavorite = useCallback((teamId) => favorites.includes(teamId), [favorites])
  return { favorites, toggle, isFavorite }
}

// ── Online Status ─────────────────────────────────────────

export function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  return online
}

// ── Language ──────────────────────────────────────────────

export function useLanguage() {
  const { i18n } = useTranslation()
  const isHebrew = i18n.language?.startsWith('he')

  const toggle = useCallback(() => {
    const next = isHebrew ? 'en' : 'he'
    i18n.changeLanguage(next)
    document.documentElement.setAttribute('dir', next === 'he' ? 'rtl' : 'ltr')
    document.documentElement.setAttribute('lang', next)
  }, [i18n, isHebrew])

  return { language: i18n.language, isHebrew, toggle }
}
