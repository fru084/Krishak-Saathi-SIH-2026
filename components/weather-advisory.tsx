'use client'

import * as React from 'react'
import { CloudRain, MapPin, Sun, ThermometerSun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLiveText } from '@/lib/use-live-text'

interface Advisory {
  spraySafe: boolean
  rainChancePercent: number
  hoursUntilRain: number | null
  temperatureC: number
  note: string
}

interface SavedLocation {
  lat: number
  lon: number
  label: string
}

// Nashik, Maharashtra — matches the demo farmer profile's district.
// Used only if the farmer hasn't set a location and geolocation is unavailable/denied.
const FALLBACK_LOCATION: SavedLocation = { lat: 19.9975, lon: 73.7898, label: 'Nashik, Maharashtra' }
const STORAGE_KEY = 'krishak-saathi:location'

const CHROME_STRINGS = [
  'Change location for the weather check',
  'e.g. Nagpur, Maharashtra',
  'Searching…',
  'Set',
  "Couldn't find that place — try a bigger nearby town.",
  'Cancel',
  'Good spray window',
  'Hold off spraying',
  'now · via Open-Meteo',
]

export function WeatherAdvisory() {
  const [advisory, setAdvisory] = React.useState<Advisory | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [location, setLocation] = React.useState<SavedLocation>(FALLBACK_LOCATION)
  const [editing, setEditing] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [searching, setSearching] = React.useState(false)
  const [searchError, setSearchError] = React.useState<string | null>(null)

  const t = useLiveText(CHROME_STRINGS)
  // Dynamic, data-driven strings — translated per current value, not part of the fixed chrome batch.
  const td = useLiveText([advisory?.note ?? '', location.label])

  const fetchAdvisory = React.useCallback((loc: SavedLocation) => {
    setLoading(true)
    fetch(`/api/weather?lat=${loc.lat}&lon=${loc.lon}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => setAdvisory(data))
      .catch(() => {
        /* Weather is a nice-to-have — fail silently, section just hides. */
      })
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed: SavedLocation = JSON.parse(stored)
        setLocation(parsed)
        fetchAdvisory(parsed)
        return
      } catch {
        /* fall through to geolocation/fallback below */
      }
    }

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude, label: 'Your location' }
          setLocation(loc)
          fetchAdvisory(loc)
        },
        () => fetchAdvisory(FALLBACK_LOCATION),
        { timeout: 4000 },
      )
    } else {
      fetchAdvisory(FALLBACK_LOCATION)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setSearchError(null)
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error('not found')
      const loc: SavedLocation = await res.json()
      setLocation(loc)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loc))
      fetchAdvisory(loc)
      setEditing(false)
      setQuery('')
    } catch {
      setSearchError(t("Couldn't find that place — try a bigger nearby town."))
    } finally {
      setSearching(false)
    }
  }

  if (editing) {
    return (
      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4"
      >
        <p className="text-sm font-semibold">{t('Change location for the weather check')}</p>
        <div className="flex gap-2">
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('e.g. Nagpur, Maharashtra')}
            className="min-h-11"
          />
          <Button type="submit" disabled={searching} className="min-h-11">
            {searching ? t('Searching…') : t('Set')}
          </Button>
        </div>
        {searchError && <p className="text-xs text-destructive">{searchError}</p>}
        <button
          type="button"
          onClick={() => {
            setEditing(false)
            setSearchError(null)
          }}
          className="w-fit text-xs text-muted-foreground underline"
        >
          {t('Cancel')}
        </button>
      </form>
    )
  }

  if (loading || !advisory) return null

  const Icon = advisory.spraySafe ? Sun : CloudRain

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 ${
        advisory.spraySafe
          ? 'border-primary/30 bg-primary/5'
          : 'border-amber-500/30 bg-amber-500/10'
      }`}
    >
      <Icon
        className={`mt-0.5 size-5 shrink-0 ${
          advisory.spraySafe ? 'text-primary' : 'text-amber-600'
        }`}
        aria-hidden="true"
      />
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-sm font-semibold">
          {advisory.spraySafe ? t('Good spray window') : t('Hold off spraying')}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {td(advisory.note)}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <ThermometerSun className="size-3.5" aria-hidden="true" />
            {advisory.temperatureC}°C {t('now · via Open-Meteo')}
          </span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 underline"
          >
            <MapPin className="size-3.5" aria-hidden="true" />
            {td(location.label)}
          </button>
        </div>
      </div>
    </div>
  )
}
