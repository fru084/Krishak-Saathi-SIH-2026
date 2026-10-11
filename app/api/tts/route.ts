import { NextResponse } from 'next/server'

import { LANGUAGES } from '@/lib/i18n'
import { checkRateLimit } from '@/lib/server/rate-limit'
import { synthesizeSpeech } from '@/lib/server/tts'
import type { LanguageCode } from '@/lib/types'

export const runtime = 'nodejs'

// Google's own per-request limit for text-to-speech is 5000 bytes.
const MAX_TEXT_BYTES = 5000
const REQUESTS_PER_MINUTE = 20

const VALID_LANGS = new Set<string>(LANGUAGES.map((l) => l.code))

export async function POST(request: Request) {
  const limited = checkRateLimit(request, 'tts', REQUESTS_PER_MINUTE)
  if (limited) return limited

  try {
    const body = await request.json()
    const text = body?.text
    const lang = (body?.lang ?? 'en') as LanguageCode

    if (typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    if (!VALID_LANGS.has(lang)) {
      return NextResponse.json({ error: `Unsupported language "${lang}"` }, { status: 400 })
    }

    if (Buffer.byteLength(text, 'utf8') > MAX_TEXT_BYTES) {
      return NextResponse.json({ error: 'Text too long' }, { status: 413 })
    }

    const audioContent = await synthesizeSpeech(text, lang)
    return NextResponse.json({ audioContent })
  } catch (error) {
    console.error('[api/tts]', error)
    return NextResponse.json({ error: 'Speech synthesis failed' }, { status: 502 })
  }
}
