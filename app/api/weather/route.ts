import { NextResponse } from 'next/server'

import { getSprayAdvisory } from '@/lib/server/weather'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = Number(searchParams.get('lat'))
  const lon = Number(searchParams.get('lon'))

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return NextResponse.json({ error: 'lat and lon query params are required' }, { status: 400 })
  }

  try {
    const advisory = await getSprayAdvisory(lat, lon)
    return NextResponse.json(advisory)
  } catch (error) {
    console.error('[api/weather]', error)
    return NextResponse.json({ error: 'Weather lookup failed' }, { status: 502 })
  }
}
