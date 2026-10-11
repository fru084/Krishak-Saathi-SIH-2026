'use client'

import * as React from 'react'
import { Mic, Send, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { askFollowUp } from '@/lib/api'
import { useLiveText } from '@/lib/use-live-text'
import { cn } from '@/lib/utils'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
}

const suggestions = [
  'Can I spray this in the evening?',
  'Is it safe for my cattle?',
  'What if it rains tomorrow?',
]

const CHROME_STRINGS = [
  'Ask a follow-up',
  'Answers in your language, based on this diagnosis',
  'Type your question…',
  'Ask by voice',
  'Your question',
  'Send question',
  'Thinking…',
  'I could not reach the advisor. Your question is saved and will be answered when you are back online.',
  ...suggestions,
]

export function FollowUpChat({
  crop,
  disease,
}: {
  crop: string
  disease: string
}) {
  const introSource = `Ask me anything about treating ${disease} on your ${crop.toLowerCase()} — dosage, timing, or what to do if it spreads.`
  const t = useLiveText([...CHROME_STRINGS, introSource])

  const [messages, setMessages] = React.useState<ChatMessage[]>([
    { id: 'intro', role: 'assistant', text: introSource },
  ])
  const [input, setInput] = React.useState('')
  const [pending, setPending] = React.useState(false)

  // Keep the intro line's translation in sync once it arrives.
  React.useEffect(() => {
    setMessages((prev) =>
      prev.map((m) => (m.id === 'intro' ? { ...m, text: t(introSource) } : m)),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t(introSource)])

  async function send(question: string, displayText?: string) {
    const trimmed = question.trim()
    if (!trimmed || pending) return

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: 'user', text: displayText ?? trimmed },
    ])
    setInput('')
    setPending(true)

    try {
      const answer = await askFollowUp(trimmed, { crop, disease })
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', text: answer },
      ])
    } catch (error) {
      console.log('[v0] askFollowUp failed:', error)
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: t('I could not reach the advisor. Your question is saved and will be answered when you are back online.'),
        },
      ])
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
          <Sparkles className="size-4" aria-hidden="true" />
        </span>
        <div className="flex flex-col">
          <p className="font-display text-base font-semibold">{t('Ask a follow-up')}</p>
          <p className="text-xs text-muted-foreground">
            {t('Answers in your language, based on this diagnosis')}
          </p>
        </div>
      </div>

      <div
        role="log"
        aria-live="polite"
        className="flex max-h-72 flex-col gap-3 overflow-y-auto"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
              message.role === 'user'
                ? 'self-end bg-primary text-primary-foreground'
                : 'self-start bg-muted text-foreground',
            )}
          >
            {message.text}
          </div>
        ))}
        {pending && (
          <div className="flex items-center gap-2 self-start rounded-2xl bg-muted px-3.5 py-2.5 text-sm text-muted-foreground">
            <Spinner className="size-4" />
            {t('Thinking…')}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion}
            variant="outline"
            size="sm"
            onClick={() => send(suggestion, t(suggestion))}
            disabled={pending}
            className="rounded-full text-xs"
          >
            {t(suggestion)}
          </Button>
        ))}
      </div>

      <InputGroup>
        <InputGroupTextarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing &&
              event.keyCode !== 229
            ) {
              event.preventDefault()
              send(input)
            }
          }}
          placeholder={t('Type your question…')}
          aria-label={t('Your question')}
        />
        <InputGroupAddon align="block-end">
          <InputGroupButton
            variant="ghost"
            size="icon-xs"
            aria-label={t('Ask by voice')}
            disabled
          >
            <Mic />
          </InputGroupButton>
          <InputGroupButton
            className="ml-auto"
            size="icon-xs"
            variant="default"
            aria-label={t('Send question')}
            onClick={() => send(input)}
            disabled={pending || !input.trim()}
          >
            <Send />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
