import { getGoogleAccessToken } from './google-auth'
import type { LanguageCode } from '@/lib/types'

/**
 * Translation for the diagnosis/treatment text and general UI copy, via
 * Google Cloud Translation API v2. Replaced the earlier Hugging Face
 * Helsinki-NLP small-model approach, which produced fluent-looking but
 * factually wrong output on longer domain-specific sentences (verified:
 * an Early Blight description came back as an unrelated sentence about
 * "spending time with children"). Google's engine handles full sentences
 * and all 10 target languages consistently, with no per-language tiering.
 */

const GOOGLE_LANG: Record<Exclude<LanguageCode, 'en'>, string> = {
  hi: 'hi',
  ur: 'ur',
  ml: 'ml',
  ta: 'ta',
  te: 'te',
  kn: 'kn',
  mr: 'mr',
  bn: 'bn',
  gu: 'gu',
  or: 'or',
}

export async function translateBatch(
  texts: string[],
  target: Exclude<LanguageCode, 'en'>,
): Promise<string[]> {
  const targetLang = GOOGLE_LANG[target]
  if (!targetLang) throw new Error(`No Google Translate mapping for "${target}"`)

  const token = await getGoogleAccessToken()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch('https://translation.googleapis.com/language/translate/v2', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: texts,
        source: 'en',
        target: targetLang,
        format: 'text',
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const detail = await response.text()
      throw new Error(`Google Translate responded ${response.status}: ${detail}`)
    }

    const data = await response.json()
    const translations: { translatedText: string }[] = data?.data?.translations ?? []
    return texts.map((original, i) => translations[i]?.translatedText ?? original)
  } finally {
    clearTimeout(timeout)
  }
}
