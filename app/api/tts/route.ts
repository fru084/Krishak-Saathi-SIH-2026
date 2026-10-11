import { NextResponse } from 'next/server'

import { synthesizeSpeech } from '@/lib/server/tts'
import type { LanguageCode } from '@/lib/types'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const text: string = body?.text ?? ''
    const lang: LanguageCode = body?.lang ?? 'en'

    if (!text.trim()) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    const audioContent = await synthesizeSpeech(text, lang)
    return NextResponse.json({ audioContent })
  } catch (error) {
    console.error('[api/tts]', error)
    return NextResponse.json({ error: 'Speech synthesis failed' }, { status: 502 })
  }
}
