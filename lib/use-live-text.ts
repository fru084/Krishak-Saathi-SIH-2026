'use client'

import * as React from 'react'

import { useLanguage } from '@/components/language-provider'
import type { LanguageCode } from './types'

/**
 * Translates a fixed batch of UI strings (headings, labels, button text —
 * anything not already covered by the static dictionary in lib/i18n.ts)
 * via /api/translate, and caches the result in localStorage per language so
 * it's fetched once per phrase, ever, not on every page visit.
 *
 * Call with the full list of strings a page needs, once, at the top of the
 * component — not per list item — so it becomes a single batched request.
 * Returns the original English text immediately and swaps in the
 * translation when it arrives, so nothing ever renders blank.
 */

const cache: Partial<Record<LanguageCode, Record<string, string>>> = {}

function cacheKey(lang: LanguageCode) {
  return `krishak-saathi:ui-text:${lang}`
}

function loadCache(lang: LanguageCode): Record<string, string> {
  if (cache[lang]) return cache[lang]!
  try {
    const stored = window.localStorage.getItem(cacheKey(lang))
    cache[lang] = stored ? JSON.parse(stored) : {}
  } catch {
    cache[lang] = {}
  }
  return cache[lang]!
}

export function useLiveText(strings: string[]) {
  const { lang } = useLanguage()
  const [, bump] = React.useState(0)
  const key = strings.join('')

  React.useEffect(() => {
    if (lang === 'en' || strings.length === 0) return

    const table = loadCache(lang)
    const missing = strings.filter((s) => s && !(s in table))
    if (missing.length === 0) return

    let cancelled = false
    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: missing, target: lang }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((body: { translations: string[] }) => {
        if (cancelled) return
        missing.forEach((s, i) => {
          table[s] = body.translations[i] ?? s
        })
        window.localStorage.setItem(cacheKey(lang), JSON.stringify(table))
        bump((n) => n + 1)
      })
      .catch(() => {
        /* Fixed UI text is a nice-to-have here — fall back to English silently. */
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, key])

  return React.useCallback(
    (source: string) => {
      if (lang === 'en' || !source) return source
      return loadCache(lang)[source] ?? source
    },
    [lang],
  )
}
