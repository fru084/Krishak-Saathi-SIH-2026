'use client'

import * as React from 'react'

import type { DiagnosisResult, LanguageCode } from './types'

interface TranslationState {
  data: DiagnosisResult | null
  translating: boolean
  /** true once we know a translation call was attempted and failed/unavailable */
  unavailable: boolean
}

/**
 * Translates the dynamic parts of a diagnosis (overview, symptoms, treatment
 * steps, prevention) via /api/translate. The static UI chrome (nav labels,
 * buttons) is already covered by lib/i18n.ts and is not touched here.
 *
 * Returns the original English result untouched when lang is 'en', or while
 * a translation is in flight / unavailable — so the screen never shows a
 * half-translated or blank state.
 */
export function useTranslatedDiagnosis(
  result: DiagnosisResult | null | undefined,
  lang: LanguageCode,
): TranslationState {
  const [state, setState] = React.useState<TranslationState>({
    data: null,
    translating: false,
    unavailable: false,
  })

  React.useEffect(() => {
    if (!result || lang === 'en') {
      setState({ data: null, translating: false, unavailable: false })
      return
    }

    let cancelled = false
    setState({ data: null, translating: true, unavailable: false })

    const organicCount = result.treatment.organic.length
    const chemicalCount = result.treatment.chemical.length

    const texts = [
      result.overview,
      ...result.symptoms,
      ...result.treatment.organic.flatMap((s) => [s.title, s.detail]),
      ...result.treatment.chemical.flatMap((s) => [s.title, s.detail]),
      result.treatment.safetyNote,
      ...result.prevention,
    ]

    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts, target: lang }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((body: { translations: string[] }) => {
        if (cancelled) return
        const t = body.translations
        let i = 0
        const next = (n: number) => t.slice(i, (i += n))

        const overview = next(1)[0]
        const symptoms = next(result.symptoms.length)
        const organicFlat = next(organicCount * 2)
        const chemicalFlat = next(chemicalCount * 2)
        const safetyNote = next(1)[0]
        const prevention = next(result.prevention.length)

        const translated: DiagnosisResult = {
          ...result,
          overview: overview ?? result.overview,
          symptoms: symptoms.length ? symptoms : result.symptoms,
          treatment: {
            organic: result.treatment.organic.map((step, idx) => ({
              ...step,
              title: organicFlat[idx * 2] ?? step.title,
              detail: organicFlat[idx * 2 + 1] ?? step.detail,
            })),
            chemical: result.treatment.chemical.map((step, idx) => ({
              ...step,
              title: chemicalFlat[idx * 2] ?? step.title,
              detail: chemicalFlat[idx * 2 + 1] ?? step.detail,
            })),
            safetyNote: safetyNote ?? result.treatment.safetyNote,
          },
          prevention: prevention.length ? prevention : result.prevention,
        }

        setState({ data: translated, translating: false, unavailable: false })
      })
      .catch(() => {
        if (!cancelled) {
          setState({ data: null, translating: false, unavailable: true })
        }
      })

    return () => {
      cancelled = true
    }
  }, [result, lang])

  return state
}
