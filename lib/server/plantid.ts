/**
 * Plant.id / Kindwise Crop Health integration.
 *
 * Docs: https://www.kindwise.com/handbook · https://web.plant.id
 * Endpoint and field names have shifted between Plant.id v2 and v3 in the past,
 * so every access below is optional-chained and the whole call is wrapped by
 * the caller in a try/catch — a schema drift degrades to the curated fallback
 * in `lib/api.ts` instead of breaking the demo.
 *
 * Get a free key at https://web.plant.id (health assessment is on the free tier
 * with a monthly request cap) and put it in `.env.local` as PLANT_ID_API_KEY.
 */

// Confirmed against the official OpenAPI spec: https://plant.id/api/v3/openapi.yaml
const ENDPOINT = 'https://plant.id/api/v3/health_assessment'

export interface PlantIdDisease {
  name: string
  /** 0 - 1 */
  probability: number
  description?: string
  treatment?: {
    biological?: string[]
    chemical?: string[]
    prevention?: string[]
  }
}

export interface PlantIdResult {
  isHealthy: boolean
  diseases: PlantIdDisease[]
  raw: unknown
}

function toBase64(input: string): string {
  // Strip a data: URL prefix if the caller passed one through.
  const commaIndex = input.indexOf(',')
  return input.startsWith('data:') && commaIndex !== -1
    ? input.slice(commaIndex + 1)
    : input
}

/**
 * Sends one photo to Plant.id's crop health assessment endpoint.
 * @param imageBase64 base64-encoded JPEG/PNG, with or without a data: prefix
 */
export async function assessCropHealth(
  imageBase64: string,
): Promise<PlantIdResult> {
  const apiKey = process.env.PLANT_ID_API_KEY
  if (!apiKey) {
    throw new Error('PLANT_ID_API_KEY is not set')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(
      `${ENDPOINT}?details=description,treatment&language=en`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': apiKey,
        },
        body: JSON.stringify({
          images: [toBase64(imageBase64)],
          similar_images: true,
        }),
        signal: controller.signal,
      },
    )

    if (!response.ok) {
      throw new Error(`Plant.id responded ${response.status}`)
    }

    const data = await response.json()
    const result = data?.result ?? {}
    const suggestions: Record<string, unknown>[] =
      result?.disease?.suggestions ?? []

    return {
      isHealthy: Boolean(result?.is_healthy?.binary ?? result?.is_healthy),
      diseases: suggestions.map((s) => ({
        name: String(s.name ?? 'Unknown issue'),
        probability: Number(s.probability ?? 0),
        description: (s.details as any)?.description,
        treatment: (s.details as any)?.treatment,
      })),
      raw: data,
    }
  } finally {
    clearTimeout(timeout)
  }
}
