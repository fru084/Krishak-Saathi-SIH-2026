import { getGoogleAccessToken } from './google-auth'
import type { LanguageCode } from '@/lib/types'

/**
 * Text-to-speech via Google Cloud Text-to-Speech — replaces the browser's
 * built-in SpeechSynthesis, whose voice availability was inconsistent
 * across devices. Google's voices are consistent regardless of the
 * listener's device/browser, since the audio is generated server-side.
 */

const VOICE_LOCALE: Record<LanguageCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
  mr: 'mr-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  gu: 'gu-IN',
  ur: 'ur-IN',
  kn: 'kn-IN',
  or: 'or-IN',
  ml: 'ml-IN',
}

export function voiceLocaleFor(lang: LanguageCode): string {
  return VOICE_LOCALE[lang] ?? 'en-IN'
}

/** Returns base64-encoded MP3 audio. */
export async function synthesizeSpeech(text: string, lang: LanguageCode): Promise<string> {
  const token = await getGoogleAccessToken()
  const languageCode = voiceLocaleFor(lang)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20000)

  try {
    const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode, ssmlGender: 'FEMALE' },
        audioConfig: { audioEncoding: 'MP3' },
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const detail = await response.text()
      throw new Error(`Google TTS responded ${response.status}: ${detail}`)
    }

    const data = await response.json()
    if (!data.audioContent) throw new Error('Google TTS returned no audio content')
    return data.audioContent as string
  } finally {
    clearTimeout(timeout)
  }
}
