/**
 * Open-Meteo integration — free, keyless, CORS-enabled.
 * Docs: https://open-meteo.com/en/docs
 *
 * Used to answer one question that matters right after a diagnosis:
 * "is it safe to spray in the next 24 hours, or will rain wash it off?"
 */

export interface SprayAdvisory {
  spraySafe: boolean
  rainChancePercent: number
  hoursUntilRain: number | null
  temperatureC: number
  note: string
}

export async function getSprayAdvisory(
  lat: number,
  lon: number,
): Promise<SprayAdvisory> {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lon))
  url.searchParams.set('hourly', 'precipitation_probability,temperature_2m')
  url.searchParams.set('forecast_days', '2')
  url.searchParams.set('timezone', 'auto')

  const response = await fetch(url.toString(), {
    // Open-Meteo updates hourly; no need to hit it on every request.
    next: { revalidate: 1800 },
  })
  if (!response.ok) {
    throw new Error(`Open-Meteo responded ${response.status}`)
  }

  const data = await response.json()
  const times: string[] = data?.hourly?.time ?? []
  const rainChances: number[] = data?.hourly?.precipitation_probability ?? []
  const temps: number[] = data?.hourly?.temperature_2m ?? []

  const now = Date.now()
  const nextWindow = times
    .map((t, i) => ({ t: new Date(t).getTime(), rain: rainChances[i], temp: temps[i] }))
    .filter((h) => h.t >= now)
    .slice(0, 12)

  if (nextWindow.length === 0) {
    throw new Error('Open-Meteo returned no forecast hours')
  }

  const maxRain = Math.max(...nextWindow.map((h) => h.rain ?? 0))
  const rainyHourIndex = nextWindow.findIndex((h) => (h.rain ?? 0) >= 50)
  const hoursUntilRain = rainyHourIndex === -1 ? null : rainyHourIndex

  const spraySafe = maxRain < 50
  const note = spraySafe
    ? `Clear for the next 12 hours — good window to spray.`
    : `Rain likely in about ${hoursUntilRain}h (${maxRain}% chance) — hold off spraying until it passes.`

  return {
    spraySafe,
    rainChancePercent: maxRain,
    hoursUntilRain,
    temperatureC: Math.round(nextWindow[0].temp ?? 0),
    note,
  }
}
