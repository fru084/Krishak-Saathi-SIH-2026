'use client'

import { Languages } from 'lucide-react'

import { useLanguage } from '@/components/language-provider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LANGUAGES } from '@/lib/i18n'
import type { LanguageCode } from '@/lib/types'

export function LanguageToggle() {
  const { lang, setLang } = useLanguage()

  return (
    <div className="flex items-center gap-2">
      <Languages
        className="size-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <Select value={lang} onValueChange={(value) => setLang(value as LanguageCode)}>
        <SelectTrigger aria-label="Select language" className="min-h-9 w-auto min-w-28 rounded-full text-xs font-semibold">
          <SelectValue>
            {(value: LanguageCode) =>
              LANGUAGES.find((l) => l.code === value)?.short ?? value
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              {language.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
