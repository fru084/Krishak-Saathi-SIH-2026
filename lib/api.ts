/**
 * Data access layer.
 *
 * Every function here is async and returns typed data, so each one can later be
 * replaced by a real network call without touching a single component:
 *
 *   diagnoseCrop  -> POST /api/diagnose  (Plant.id / Kindwise + Groq for the text)
 *   getScans      -> Supabase select from `scans`
 *   saveScan      -> Supabase insert into `scans` + Storage upload
 *   askFollowUp   -> POST /api/chat      (Groq / Gemini)
 *
 * Until then an in-memory store below acts as the database.
 */

import { CURATED_DIAGNOSES } from './curated-diagnoses'
import type {
  DiagnosisResult,
  FarmerProfile,
  ScanRecord,
  ScanStatus,
  Severity,
} from './types'

const NETWORK_DELAY = 450

function wait<T>(value: T, ms = NETWORK_DELAY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

/* -------------------------------------------------------------------------- */
/*                              Mock "database"                               */
/* -------------------------------------------------------------------------- */

let diagnoses: DiagnosisResult[] = [...CURATED_DIAGNOSES]

let scans: ScanRecord[] = [
  {
    id: 'scan-1',
    resultId: 'dx-1001',
    crop: 'Tomato',
    disease: 'Early Blight',
    imageUrl: '/scans/tomato-early-blight.png',
    date: '2026-08-21T06:40:00.000Z',
    severity: 'High',
    status: 'Monitoring',
  },
  {
    id: 'scan-2',
    resultId: 'dx-1002',
    crop: 'Rice',
    disease: 'Rice Blast',
    imageUrl: '/scans/rice-blast.png',
    date: '2026-08-18T11:05:00.000Z',
    severity: 'Medium',
    status: 'Treated',
  },
  {
    id: 'scan-3',
    resultId: 'dx-1003',
    crop: 'Wheat',
    disease: 'Yellow Stripe Rust',
    imageUrl: '/scans/wheat-rust.png',
    date: '2026-07-30T05:20:00.000Z',
    severity: 'Medium',
    status: 'Resolved',
  },
  {
    id: 'scan-4',
    resultId: 'dx-1004',
    crop: 'Cotton',
    disease: 'Leaf Curl Virus',
    imageUrl: '/scans/cotton-leaf-curl.png',
    date: '2026-07-12T09:15:00.000Z',
    severity: 'Low',
    status: 'Resolved',
  },
  {
    id: 'scan-5',
    resultId: 'dx-1005',
    crop: 'Onion',
    disease: 'Purple Blotch',
    imageUrl: '',
    date: '2026-08-05T07:30:00.000Z',
    severity: 'Medium',
    status: 'Monitoring',
  },
  {
    id: 'scan-6',
    resultId: 'dx-1006',
    crop: 'Chilli',
    disease: 'Anthracnose (Fruit Rot)',
    imageUrl: '',
    date: '2026-08-14T10:00:00.000Z',
    severity: 'High',
    status: 'Treated',
  },
]

let profile: FarmerProfile = {
  name: 'Ramesh Patil',
  village: 'Karadi',
  district: 'Nashik',
  state: 'Maharashtra',
  crops: ['Tomato', 'Cotton', 'Wheat', 'Onion'],
  landSizeAcres: 4.5,
  language: 'en',
  offlineMode: true,
  dataSaver: false,
}

/* -------------------------------------------------------------------------- */
/*                                    API                                     */
/* -------------------------------------------------------------------------- */

/** Latest scans for the home screen carousel. */
export async function getRecentScans(limit = 4): Promise<ScanRecord[]> {
  return wait(scans.slice(0, limit))
}

/** Full farm log. */
export async function getScans(): Promise<ScanRecord[]> {
  return wait(scans)
}

export async function getDiagnosis(id: string): Promise<DiagnosisResult | null> {
  return wait(diagnoses.find((d) => d.id === id) ?? null)
}

/**
 * Sends the captured photo to /api/diagnose (Plant.id under the hood).
 * If the request fails — no API key configured yet, offline, rate-limited,
 * anything — this falls back to a curated mock result so the flow never
 * breaks mid-demo. Check `result.source` ('live' | 'demo') if you want to
 * show the farmer which kind of result they got.
 */
export async function diagnoseCrop(
  imageFile: File,
  crop?: string,
): Promise<DiagnosisResult> {
  const previewUrl =
    typeof window === 'undefined' ? undefined : URL.createObjectURL(imageFile)

  try {
    const form = new FormData()
    form.append('image', imageFile)
    if (crop) form.append('crop', crop)

    const response = await fetch('/api/diagnose', { method: 'POST', body: form })
    if (!response.ok) throw new Error(`/api/diagnose responded ${response.status}`)

    const result = (await response.json()) as DiagnosisResult
    result.imageUrl = previewUrl ?? result.imageUrl
    diagnoses.unshift(result)
    return result
  } catch (error) {
    console.log('[krishak-saathi] live diagnosis unavailable, using demo data:', error)
    const template = diagnoses[Math.floor(Math.random() * diagnoses.length)]
    const result: DiagnosisResult = {
      ...template,
      id: `dx-${Date.now()}`,
      imageUrl: previewUrl ?? template.imageUrl,
      createdAt: new Date().toISOString(),
      savedOffline: true,
      source: 'demo',
    }
    diagnoses.unshift(result)
    return wait(result, 1200)
  }
}

/** Persists a diagnosis into the farm log. */
export async function saveScan(result: DiagnosisResult): Promise<ScanRecord> {
  const existing = scans.find((s) => s.resultId === result.id)
  if (existing) return wait(existing)

  const record: ScanRecord = {
    id: `scan-${Date.now()}`,
    resultId: result.id,
    crop: result.crop,
    disease: result.disease,
    imageUrl: result.imageUrl,
    date: result.createdAt,
    severity: result.severity,
    status: 'Monitoring',
  }
  scans = [record, ...scans]
  return wait(record)
}

export async function updateScanStatus(
  id: string,
  status: ScanStatus,
): Promise<ScanRecord | null> {
  scans = scans.map((s) => (s.id === id ? { ...s, status } : s))
  return wait(scans.find((s) => s.id === id) ?? null)
}

/** Mock hand-off to the block level agriculture officer. */
export async function shareWithOfficer(resultId: string): Promise<{ ok: true }> {
  console.log('[v0] shareWithOfficer', resultId)
  return wait({ ok: true } as const, 900)
}

export async function getProfile(): Promise<FarmerProfile> {
  return wait(profile)
}

export async function updateProfile(
  patch: Partial<FarmerProfile>,
): Promise<FarmerProfile> {
  profile = { ...profile, ...patch }
  return wait(profile, 200)
}

/** Chatbot follow-up. Later: a streaming Groq / Gemini call with the diagnosis as context. */
export async function askFollowUp(
  question: string,
  context: { disease: string; crop: string },
): Promise<string> {
  const answer =
    `For ${context.crop} affected by ${context.disease}: start with the organic steps in the treatment plan ` +
    `and re-check the same leaves after 7 days. If new spots keep appearing on fresh growth, move to the ` +
    `chemical option and rotate the molecule. Spray in the evening and keep the recommended gap before harvest.`
  return wait(answer, 1200)
}

export const CROP_OPTIONS = [
  'Tomato',
  'Rice',
  'Wheat',
  'Cotton',
  'Onion',
  'Sugarcane',
  'Groundnut',
  'Chilli',
  'Soybean',
  'Maize',
] as const

export const SEVERITY_OPTIONS: Severity[] = ['Low', 'Medium', 'High']
