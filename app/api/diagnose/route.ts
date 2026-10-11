import { NextResponse } from 'next/server'

import { CURATED_DIAGNOSES } from '@/lib/curated-diagnoses'
import { assessCropHealth } from '@/lib/server/plantid'
import type { DiagnosisResult, Severity, TreatmentStep } from '@/lib/types'

export const runtime = 'nodejs'

function severityFromConfidence(confidence: number): Severity {
  if (confidence >= 85) return 'High'
  if (confidence >= 60) return 'Medium'
  return 'Low'
}

function findCuratedMatch(diseaseName: string) {
  const needle = diseaseName.toLowerCase()
  return CURATED_DIAGNOSES.find((d) => {
    const hay = `${d.disease} ${d.scientificName}`.toLowerCase()
    return (
      hay.includes(needle) ||
      needle.includes(d.disease.toLowerCase()) ||
      d.disease
        .toLowerCase()
        .split(' ')
        .some((word) => word.length > 4 && needle.includes(word))
    )
  })
}

function shortTitle(line: string, maxLen = 60): string {
  const firstClause = line.split(/[.,;]/)[0]?.trim() || line
  if (firstClause.length <= maxLen) return firstClause
  const truncated = firstClause.slice(0, maxLen)
  const lastSpace = truncated.lastIndexOf(' ')
  return `${truncated.slice(0, lastSpace > 20 ? lastSpace : maxLen)}…`
}

function toSteps(lines: string[] | undefined): TreatmentStep[] {
  return (lines ?? []).map((line, i) => ({
    step: i + 1,
    title: shortTitle(line) || `Step ${i + 1}`,
    detail: line,
  }))
}

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const image = form.get('image')
    const crop = String(form.get('crop') ?? '')

    if (!(image instanceof File)) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await image.arrayBuffer())
    const base64 = buffer.toString('base64')

    const plantIdResult = await assessCropHealth(base64)
    const topDisease = plantIdResult.diseases
      .sort((a, b) => b.probability - a.probability)
      .at(0)

    if (!topDisease) {
      return NextResponse.json(
        { error: 'No disease detected in image' },
        { status: 422 },
      )
    }

    const confidence = Math.round(topDisease.probability * 100)
    const curatedMatch = findCuratedMatch(topDisease.name)

    const result: DiagnosisResult = curatedMatch
      ? {
          ...curatedMatch,
          id: `dx-${Date.now()}`,
          crop: crop || curatedMatch.crop,
          confidence,
          severity: severityFromConfidence(confidence),
          imageUrl: '',
          createdAt: new Date().toISOString(),
          savedOffline: true,
          source: 'live',
        }
      : {
          id: `dx-${Date.now()}`,
          crop: crop || 'Unknown crop',
          disease: topDisease.name,
          scientificName: '—',
          confidence,
          severity: severityFromConfidence(confidence),
          imageUrl: '',
          overview:
            topDisease.description ||
            'No detailed description was returned for this result. Please confirm with your local Krishi Vigyan Kendra.',
          symptoms: [],
          treatment: {
            organic: toSteps(topDisease.treatment?.biological),
            chemical: toSteps(topDisease.treatment?.chemical),
            safetyNote:
              'Always confirm dosage with your local agriculture officer before spraying — this result has no curated review yet.',
          },
          prevention: topDisease.treatment?.prevention ?? [],
          similarCases: [],
          createdAt: new Date().toISOString(),
          savedOffline: true,
          source: 'live',
        }

    return NextResponse.json(result)
  } catch (error) {
    console.error('[api/diagnose]', error)
    return NextResponse.json(
      { error: 'Diagnosis failed', detail: String(error) },
      { status: 502 },
    )
  }
}
