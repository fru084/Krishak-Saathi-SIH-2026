import { NextResponse } from 'next/server'

import { checkRateLimit } from '@/lib/server/rate-limit'
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

// Generous for real use (a full diagnosis is roughly 40 strings, under 10k
// characters) but small enough that one request can't burn the quota.
const MAX_ITEMS = 120
const MAX_ITEM_CHARS = 2000
const MAX_TOTAL_CHARS = 20000
const REQUESTS_PER_MINUTE = 120

export async function POST(request: Request) {
  const limited = checkRateLimit(request, 'translate', REQUESTS_PER_MINUTE)
  if (limited) return limited

  try {
    const body = await request.json()
    const texts: unknown = body?.texts ?? []
    const target = body?.target as Exclude<LanguageCode, 'en'> | undefined

    if (
      !Array.isArray(texts) ||
      texts.length === 0 ||
      !texts.every((t) => typeof t === 'string') ||
      !target
    ) {
      return NextResponse.json(
        { error: `Body must be { texts: string[], target: one of ${SUPPORTED_TARGETS.join(', ')} }` },
        { status: 400 },
      )
    }

    if (!SUPPORTED_TARGETS.includes(target)) {
      return NextResponse.json({ error: `Unsupported target language "${target}"` }, { status: 400 })
    }

    const strings = texts as string[]
    const totalChars = strings.reduce((sum, t) => sum + t.length, 0)
    if (
      strings.length > MAX_ITEMS ||
      strings.some((t) => t.length > MAX_ITEM_CHARS) ||
      totalChars > MAX_TOTAL_CHARS
    ) {
      return NextResponse.json(
        { error: 'Request too large', limits: { MAX_ITEMS, MAX_ITEM_CHARS, MAX_TOTAL_CHARS } },
        { status: 413 },
      )
    }

    const translations = await translateBatch(strings, target)
    return NextResponse.json({ translations })
  } catch (error) {
    console.error('[api/translate]', error)
    return NextResponse.json({ error: 'Translation failed' }, { status: 502 })
  }
}
