import path from 'node:path'
import { GoogleAuth } from 'google-auth-library'

/**
 * Shared Google Cloud auth for Translation and Text-to-Speech.
 *
 * Supports two ways to supply the service account key, so the same code
 * works locally and on Vercel:
 *  - GOOGLE_CREDENTIALS_JSON — the full key file contents as one env var
 *    string. Use this on Vercel (Project Settings → Environment Variables),
 *    since serverless functions don't have a persistent filesystem to read
 *    a key file from.
 *  - GOOGLE_APPLICATION_CREDENTIALS — a file path, resolved relative to the
 *    project root. Used for local dev via .secrets/google-credentials.json.
 */

let auth: GoogleAuth | null = null

export async function getGoogleAccessToken(): Promise<string> {
  if (!auth) {
    const inlineJson = process.env.GOOGLE_CREDENTIALS_JSON

    if (inlineJson) {
      auth = new GoogleAuth({
        credentials: JSON.parse(inlineJson),
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      })
    } else {
      const configured = process.env.GOOGLE_APPLICATION_CREDENTIALS
      if (!configured) {
        throw new Error(
          'Set either GOOGLE_CREDENTIALS_JSON or GOOGLE_APPLICATION_CREDENTIALS',
        )
      }
      const keyFile = path.isAbsolute(configured)
        ? configured
        : path.join(/* turbopackIgnore: true */ process.cwd(), configured)
      auth = new GoogleAuth({
        keyFile,
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      })
    }
  }
  const client = await auth.getClient()
  const token = await client.getAccessToken()
  if (!token.token) throw new Error('Failed to obtain Google Cloud access token')
  return token.token
}
