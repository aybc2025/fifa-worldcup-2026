export const TOURNAMENT = {
  name: 'FIFA World Cup 2026',
  startDate: '2026-06-11',
  endDate: '2026-07-19',
  hosts: ['USA', 'Canada', 'Mexico'],
  totalTeams: 48,
  totalMatches: 104,
  leagueId: 1,
  season: 2026,
}

export const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

export const STAGES = {
  GROUP: 'Group Stage',
  R32: 'Round of 32',
  R16: 'Round of 16',
  QF: 'Quarter-finals',
  SF: 'Semi-finals',
  THIRD: '3rd Place',
  FINAL: 'Final',
}

// React Query stale times (ms)
export const TTL = {
  LIVE_MATCH: 30_000,        // 30 seconds — live score/events
  STANDINGS: 10 * 60_000,    // 10 minutes
  KNOCKOUT: 15 * 60_000,     // 15 minutes
  SQUAD: 24 * 60 * 60_000,   // 24 hours
  TOP_SCORERS: 10 * 60_000,  // 10 minutes
  FIXTURES_ALL: 5 * 60_000,  // 5 minutes (between matches)
}

// Polling intervals when a match is live vs. not
export const POLL = {
  LIVE: 30_000,
  IDLE: 5 * 60_000,
}

export const FLAG_URL = (code) =>
  `https://flagcdn.com/w80/${code?.toLowerCase()}.png`

export const COUNTRY_CODES = {
  // WC2026 Group A
  'Mexico': 'mx', 'South Africa': 'za', 'South Korea': 'kr', 'Czech Republic': 'cz',
  // WC2026 Group B
  'Canada': 'ca', 'Bosnia & Herzegovina': 'ba', 'Qatar': 'qa', 'Switzerland': 'ch',
  // WC2026 Group C
  'Brazil': 'br', 'Morocco': 'ma', 'Haiti': 'ht', 'Scotland': 'gb-sct',
  // WC2026 Group D
  'USA': 'us', 'Paraguay': 'py', 'Australia': 'au', 'Turkey': 'tr',
  // WC2026 Group E
  'Germany': 'de', 'Curaçao': 'cw', 'Ivory Coast': 'ci', 'Ecuador': 'ec',
  // WC2026 Group F
  'Netherlands': 'nl', 'Japan': 'jp', 'Sweden': 'se', 'Tunisia': 'tn',
  // WC2026 Group G
  'Belgium': 'be', 'Egypt': 'eg', 'Iran': 'ir', 'New Zealand': 'nz',
  // WC2026 Group H
  'Spain': 'es', 'Cape Verde': 'cv', 'Saudi Arabia': 'sa', 'Uruguay': 'uy',
  // WC2026 Group I
  'France': 'fr', 'Senegal': 'sn', 'Iraq': 'iq', 'Norway': 'no',
  // WC2026 Group J
  'Argentina': 'ar', 'Algeria': 'dz', 'Austria': 'at', 'Jordan': 'jo',
  // WC2026 Group K
  'Portugal': 'pt', 'DR Congo': 'cd', 'Uzbekistan': 'uz', 'Colombia': 'co',
  // WC2026 Group L
  'England': 'gb-eng', 'Croatia': 'hr', 'Ghana': 'gh', 'Panama': 'pa',
  // Extras kept for fallback
  'Georgia': 'ge', 'Italy': 'it', 'Poland': 'pl', 'Denmark': 'dk',
  'Wales': 'gb-wls', 'Serbia': 'rs', 'Ukraine': 'ua', 'Chile': 'cl',
  'Peru': 'pe', 'Costa Rica': 'cr', 'Honduras': 'hn',
}
