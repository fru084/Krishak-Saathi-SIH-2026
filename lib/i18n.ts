import type { LanguageCode } from './types'

export const LANGUAGES: { code: LanguageCode; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'hi', label: 'हिन्दी (Hindi)', short: 'हि' },
  { code: 'bn', label: 'বাংলা (Bengali)', short: 'বাং' },
  { code: 'mr', label: 'मराठी (Marathi)', short: 'मर' },
  { code: 'te', label: 'తెలుగు (Telugu)', short: 'తె' },
  { code: 'ta', label: 'தமிழ் (Tamil)', short: 'த' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)', short: 'ગુ' },
  { code: 'ur', label: 'اردو (Urdu)', short: 'اردو' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)', short: 'ಕ' },
  { code: 'or', label: 'ଓଡ଼ିଆ (Odia)', short: 'ଓଡ଼' },
  { code: 'ml', label: 'മലയാളം (Malayalam)', short: 'മല' },
]
