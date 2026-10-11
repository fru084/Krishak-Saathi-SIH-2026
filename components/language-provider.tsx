'use client'

import * as React from 'react'

import { LANGUAGES } from '@/lib/i18n'
import type { LanguageCode } from '@/lib/types'

const VALID_CODES = new Set<LanguageCode>(LANGUAGES.map((l) => l.code))

interface LanguageContextValue {
  lang: LanguageCode
  setLang: (lang: LanguageCode) => void
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null)

const STORAGE_KEY = 'krishak-saathi:lang'

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<LanguageCode>('en')

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as LanguageCode | null
    if (stored && VALID_CODES.has(stored)) {
      setLangState(stored)
    }
  }, [])

  const setLang = React.useCallback((next: LanguageCode) => {
    setLangState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const value = React.useMemo<LanguageContextValue>(
    () => ({ lang, setLang }),
    [lang, setLang],
  )

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = React.useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used inside <LanguageProvider>')
  }
  return ctx
}
