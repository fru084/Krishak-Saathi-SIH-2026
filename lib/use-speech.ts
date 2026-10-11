'use client'

import * as React from 'react'

import type { LanguageCode } from './types'

/**
 * Text-to-speech via our own /api/tts route (Google Cloud Text-to-Speech).
 * Replaced the browser's built-in SpeechSynthesis — voice availability
 * there depended on the listener's device/OS and was inconsistent (several
 * languages had no voice at all on some phones). Google's voices are
 * generated server-side, so playback sounds identical everywhere — except
 * Odia, which Google Cloud TTS doesn't have a voice for at all (verified
 * directly against the API); that case surfaces as `unavailable`, not a
 * silent failure.
 *
 * Audio is cached in memory per (text, language) pair for the life of the
 * tab, so replaying the same clip — very common, since "Listen" invites a
 * second listen — costs zero network time on repeat.
 */

const audioCache = new Map<string, string>()

function cacheKey(text: string, lang: LanguageCode) {
  return `${lang}::${text}`
}

export function useSpeech() {
  const [speaking, setSpeaking] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [unavailable, setUnavailable] = React.useState(false)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  const stop = React.useCallback(() => {
    audioRef.current?.pause()
    audioRef.current = null
    setSpeaking(false)
    setLoading(false)
  }, [])

  const speak = React.useCallback(async (text: string, lang: LanguageCode) => {
    stop()
    setUnavailable(false)
    setLoading(true)
    try {
      const key = cacheKey(text, lang)
      let audioContent = audioCache.get(key)

      if (!audioContent) {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, lang }),
        })
        if (!res.ok) {
          if (res.status === 502) {
            setUnavailable(true)
            return
          }
          throw new Error(`TTS request failed: ${res.status}`)
        }
        const body = (await res.json()) as { audioContent: string }
        audioContent = body.audioContent
        audioCache.set(key, audioContent)
      }

      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`)
      audioRef.current = audio
      audio.onplay = () => setSpeaking(true)
      audio.onended = () => setSpeaking(false)
      audio.onerror = () => setSpeaking(false)
      await audio.play()
    } catch (error) {
      console.log('[krishak-saathi] TTS failed:', error)
      setSpeaking(false)
    } finally {
      setLoading(false)
    }
  }, [stop])

  return { speak, stop, speaking, loading, unavailable }
}
