/**
 * Lightweight, dependency-free photo-quality check — runs entirely in the
 * browser on a downscaled copy of the image, so it's fast and costs
 * nothing. Catches the two most common reasons a diagnosis comes back
 * useless: the photo is too dark to see symptoms, or it's out of focus.
 *
 * Deliberately advisory, not a hard block — a heuristic can misfire, and
 * refusing to let a farmer submit a real (if imperfect) photo would be
 * worse than a slightly-off diagnosis. It just tells them what's wrong.
 */

export interface QualityIssue {
  code: 'dark' | 'bright' | 'blurry'
  message: string
}

const SAMPLE_SIZE = 96

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not read image'))
    img.src = URL.createObjectURL(file)
  })
}

export async function checkImageQuality(file: File): Promise<QualityIssue[]> {
  const issues: QualityIssue[] = []

  let img: HTMLImageElement
  try {
    img = await loadImage(file)
  } catch {
    return issues // Can't analyze it — let the real API be the judge.
  }

  const canvas = document.createElement('canvas')
  canvas.width = SAMPLE_SIZE
  canvas.height = SAMPLE_SIZE
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) {
    URL.revokeObjectURL(img.src)
    return issues
  }

  ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE)
  const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE)
  URL.revokeObjectURL(img.src)

  const gray = new Float32Array(SAMPLE_SIZE * SAMPLE_SIZE)
  let sum = 0
  for (let i = 0; i < gray.length; i++) {
    const o = i * 4
    const luma = 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2]
    gray[i] = luma
    sum += luma
  }
  const brightness = sum / gray.length

  if (brightness < 45) {
    issues.push({
      code: 'dark',
      message: 'This photo looks quite dark — try again in better light for a more accurate diagnosis.',
    })
  } else if (brightness > 235) {
    issues.push({
      code: 'bright',
      message: 'This photo looks washed out or overexposed — try again out of direct glare.',
    })
  }

  // Laplacian-variance sharpness estimate: low variance in the second
  // derivative means few sharp edges, i.e. the image is likely blurry.
  let lapSum = 0
  let lapSumSq = 0
  let count = 0
  for (let y = 1; y < SAMPLE_SIZE - 1; y++) {
    for (let x = 1; x < SAMPLE_SIZE - 1; x++) {
      const idx = y * SAMPLE_SIZE + x
      const lap =
        4 * gray[idx] -
        gray[idx - 1] -
        gray[idx + 1] -
        gray[idx - SAMPLE_SIZE] -
        gray[idx + SAMPLE_SIZE]
      lapSum += lap
      lapSumSq += lap * lap
      count++
    }
  }
  const mean = lapSum / count
  const variance = lapSumSq / count - mean * mean

  if (variance < 60) {
    issues.push({
      code: 'blurry',
      message: 'This photo looks a little blurry — hold the camera steady and make sure the leaf is in focus.',
    })
  }

  return issues
}
