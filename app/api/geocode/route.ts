import { NextResponse } from 'next/server'

/**
 * Turns a typed city/village name into coordinates for the weather advisory,
 * using OpenStreetMap's free Nominatim geocoder.
 * Docs: https://nominatim.org/release-docs/latest/api/Search/
 *
 * Nominatim's usage policy requires a real identifying User-Agent and caps
 * the public instance at ~1 request/second — fine for a farmer occasionally
 * changing their location, not for bulk lookups.
 */
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()

  if (!q) {
    return NextResponse.json({ error: 'q query param is required' }, { status: 400 })
  }

  try {
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('q', q)
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('limit', '1')
    url.searchParams.set('countrycodes', 'in')

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'KrishakSaathi/1.0 (SIH 2026 hackathon prototype)',
      },
    })
    if (!response.ok) throw new Error(`Nominatim responded ${response.status}`)

    const results = await response.json()
    const top = results?.[0]
    if (!top) {
      return NextResponse.json({ error: 'No matching location found' }, { status: 404 })
    }

    return NextResponse.json({
      lat: Number(top.lat),
      lon: Number(top.lon),
      label: top.display_name.split(',').slice(0, 2).join(',').trim(),
    })
  } catch (error) {
    console.error('[api/geocode]', error)
    return NextResponse.json({ error: 'Location lookup failed' }, { status: 502 })
  }
}
