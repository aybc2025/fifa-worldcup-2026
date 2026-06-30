/**
 * API Proxy — runs server-side only.
 * API keys never reach the client bundle.
 * CDN caching via Cache-Control headers reduces actual API calls.
 */

const ALLOWED_ENDPOINTS = new Set([
  'fixtures',
  'fixtures/lineups',
  'fixtures/events',
  'fixtures/statistics',
  'standings',
  'players/squads',
  'players/topscorers',
])

// TTL per endpoint type (seconds) — for CDN edge caching
const CACHE_TTL = {
  'fixtures': 30,           // live match data: 30s
  'fixtures/lineups': 30,
  'fixtures/events': 30,
  'fixtures/statistics': 30,
  'standings': 600,         // standings: 10min
  'players/squads': 86400,  // squads: 24h
  'players/topscorers': 600,
}

export default async (request) => {
  const url = new URL(request.url)
  const endpoint = url.searchParams.get('endpoint')
  const source = url.searchParams.get('source') || 'apifootball'

  if (!endpoint || !ALLOWED_ENDPOINTS.has(endpoint)) {
    return new Response(
      JSON.stringify({ error: 'Invalid or missing endpoint' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    let upstreamUrl, headers

    if (source === 'footballdata') {
      const key = Netlify.env.get('FOOTBALL_DATA_KEY')
      if (!key) return configError()
      // Build upstream URL — pass through allowed params only
      const params = new URLSearchParams({ season: '2026' })
      for (const [k, v] of url.searchParams.entries()) {
        if (!['endpoint', 'source'].includes(k)) params.set(k, v)
      }
      upstreamUrl = `https://api.football-data.org/v4/${endpoint}?${params}`
      headers = { 'X-Auth-Token': key }
    } else {
      // Default: api-sports.io
      const key = Netlify.env.get('API_FOOTBALL_KEY')
      if (!key) return configError()
      const params = new URLSearchParams({ league: '1', season: '2026' })
      for (const [k, v] of url.searchParams.entries()) {
        if (!['endpoint', 'source'].includes(k)) params.set(k, v)
      }
      upstreamUrl = `https://v3.football.api-sports.io/${endpoint}?${params}`
      headers = { 'x-apisports-key': key }
    }

    const resp = await fetch(upstreamUrl, { headers })

    if (!resp.ok) {
      console.error(`Upstream error: ${resp.status} for ${endpoint}`)
      return new Response(
        JSON.stringify({ error: 'Upstream request failed', status: resp.status }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const data = await resp.json()
    const ttl = CACHE_TTL[endpoint] ?? 60

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // s-maxage: CDN caches this; all users within ttl window share one upstream call
        'Cache-Control': `public, s-maxage=${ttl}, stale-while-revalidate=${ttl}`,
      },
    })
  } catch (err) {
    // Don't leak internal error details to client
    console.error('api-proxy error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal proxy error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

function configError() {
  return new Response(
    JSON.stringify({ error: 'API key not configured' }),
    { status: 500, headers: { 'Content-Type': 'application/json' } }
  )
}

export const config = { path: '/api/proxy' }
