const RAW = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026'

async function apiFetch(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10_000)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  } finally {
    clearTimeout(timer)
  }
}

// All 104 fixtures with scores and goal events
export const fetchAllFixtures = () => apiFetch(`${RAW}/worldcup.json`)

// All 48 teams (name, fifa_code, group, continent, confed)
export const fetchTeamsData = () => apiFetch(`${RAW}/worldcup.teams.json`)
