import { NextResponse } from 'next/server'

/**
 * Minimal per-visitor rate limiter for the API routes that cost money or
 * quota (translation, text-to-speech, diagnosis).
 *
 * State lives in this server instance's memory, so it is best-effort: on a
 * serverless host each instance keeps its own counts and they reset when an
 * instance restarts. That is enough to stop casual abuse and runaway loops;
 * the Google Cloud quota and budget alert remain the hard backstop.
 */

const hits = new Map<string, number[]>()

function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return (
    forwarded?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'local'
  )
}

/** Returns a 429 response if the caller is over the limit, otherwise null. */
export function checkRateLimit(
  request: Request,
  route: string,
  limit: number,
  windowMs = 60_000,
): NextResponse | null {
  const key = `${route}:${clientKey(request)}`
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)

  if (recent.length >= limit) {
    hits.set(key, recent)
    const retryAfter = Math.max(1, Math.ceil((windowMs - (now - recent[0])) / 1000))
    return NextResponse.json(
      { error: 'Too many requests — please wait a moment and try again.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    )
  }

  recent.push(now)
  hits.set(key, recent)

  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= windowMs)) hits.delete(k)
    }
  }
  return null
}
