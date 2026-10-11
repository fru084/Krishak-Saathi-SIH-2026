/**
 * Shared domain types for Krishak Saathi.
 * These are the contracts the UI depends on. Swapping the mock functions in
 * `lib/api.ts` for real endpoints (Plant.id / Kindwise, Groq / Gemini, Supabase)
 * should not require changing any component.
 */

export type LanguageCode =
  | 'en'
  | 'hi'
  | 'ur'
  | 'ml'
  | 'ta'
  | 'te'
  | 'kn'
  | 'mr'
  | 'bn'
  | 'gu'
  | 'or'

export type Severity = 'Low' | 'Medium' | 'High'

export type ScanStatus = 'Treated' | 'Monitoring' | 'Resolved'

export interface TreatmentStep {
  step: number
  title: string
  detail: string
  /** e.g. "Neem oil 5 ml/L", used for shopping / dosage hints */
  input?: string
}

export interface TreatmentPlan {
  organic: TreatmentStep[]
  chemical: TreatmentStep[]
  /** Free-text safety note shown under the chemical plan */
  safetyNote: string
}

export interface SimilarCase {
  id: string
  village: string
  crop: string
  disease: string
  distanceKm: number
  outcome: string
}

export interface DiagnosisResult {
  id: string
  crop: string
  disease: string
  scientificName: string
  /** 0 - 100 */
  confidence: number
  severity: Severity
  imageUrl: string
  overview: string
  symptoms: string[]
  treatment: TreatmentPlan
  prevention: string[]
  similarCases: SimilarCase[]
  createdAt: string
  savedOffline: boolean
  /** 'live' = Plant.id result, 'demo' = curated fallback (no API key / call failed) */
  source?: 'live' | 'demo'
}

export interface ScanRecord {
  id: string
  resultId: string
  crop: string
  disease: string
  imageUrl: string
  date: string
  severity: Severity
  status: ScanStatus
}

export interface FarmerProfile {
  name: string
  village: string
  district: string
  state: string
  crops: string[]
  landSizeAcres: number
  language: LanguageCode
  offlineMode: boolean
  dataSaver: boolean
}

export interface FollowUpAnswer {
  question: string
  answer: string
  answeredAt: string
}
