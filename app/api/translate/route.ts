import { NextResponse } from 'next/server'

import { translateBatch } from '@/lib/server/translate'
import type { LanguageCode } from '@/lib/types'

export const runtime = 'nodejs'

const SUPPORTED_TARGETS: Exclude<LanguageCode, 'en'>[] = [
  'hi',
  'ur',
  'ml',
  'ta',
  'te',
  'kn',
  'mr',
  'bn',
  'gu',
  'or',
]

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const texts: string[] = body?.texts ?? []
    const target = body?.target as Exclude<LanguageCode, 'en'> | undefined

    if (!Array.isArray(texts) || texts.length === 0 || !target) {
      return NextResponse.json(
        { error: `Body must be { texts: string[], target: one of ${SUPPORTED_TARGETS.join(', ')} }` },
        { status: 400 },
      )
    }

    if (!SUPPORTED_TARGETS.includes(target)) {
      return NextResponse.json({ error: `Unsupported target language "${target}"` }, { status: 400 })
    }

    const translations = await translateBatch(texts, target)
    return NextResponse.json({ translations })
  } catch (error) {
    console.error('[api/translate]', error)
    return NextResponse.json({ error: 'Translation failed' }, { status: 502 })
  }
}
