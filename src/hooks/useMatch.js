import { useQuery } from '@tanstack/react-query'
import { fetchAllFixtures } from '../services/apiClient'
import { normalizeFixtures } from './useMatches'
import { TTL, POLL } from '../config/constants'

const LIVE_STATUSES = new Set(['1H', 'HT', '2H', 'ET', 'P', 'BT', 'LIVE'])

export function useMatch(id) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['fixtures', 'all'],
    queryFn: fetchAllFixtures,
    staleTime: TTL.LIVE_MATCH,
    refetchInterval: (query) => {
      const fixtures = normalizeFixtures(query.state.data)
      const match = fixtures.find((f) => String(f.fixture?.id) === String(id))
      const status = match?.fixture?.status?.short
      return LIVE_STATUSES.has(status) ? POLL.LIVE : false
    },
    refetchIntervalInBackground: false,
    enabled: !!id,
  })

  const fixtures = normalizeFixtures(data)
  const fixture = fixtures.find((f) => String(f.fixture?.id) === String(id)) ?? null
  const isLive = LIVE_STATUSES.has(fixture?.fixture?.status?.short)

  return {
    fixture,
    isLive,
    isLoading,
    isError,
    error,
    events: fixture?.events ?? [],
    lineups: [],
    stats: [],
  }
}
