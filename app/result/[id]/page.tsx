'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import {
  ArrowLeft,
  BookmarkCheck,
  Download,
  MapPin,
  Send,
  ShieldPlus,
  Square,
  Volume2,
} from 'lucide-react'
import { toast } from 'sonner'

import { FollowUpChat } from '@/components/follow-up-chat'
import { useLanguage } from '@/components/language-provider'
import { SeverityBadge } from '@/components/severity-badge'
import { TreatmentPlan } from '@/components/treatment-plan'
import { WeatherAdvisory } from '@/components/weather-advisory'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { getDiagnosis, saveScan, shareWithOfficer } from '@/lib/api'
import { useLiveText } from '@/lib/use-live-text'
import { useSpeech } from '@/lib/use-speech'
import { useTranslatedDiagnosis } from '@/lib/use-translated-diagnosis'


const PAGE_STRINGS = [
  'Back to farm log',
  'Diagnosis not found',
  'This scan may have been removed from your device. Try scanning the leaf again.',
  'Scan a leaf',
  'Live AI result',
  'Demo data',
  'Translation unavailable right now — showing English.',
  'Model confidence',
  'Based on leaf pattern matching. Confirm with your Krishi Vigyan Kendra before large-scale spraying.',
  'Stop',
  'Listen in my language',
  'Translating…',
  'Preparing audio…',
  'Voice not available for this language yet — try Hindi, Marathi, or another supported language.',
  'What to look for',
  'Treatment plan',
  'Stop it coming back',
  'preventive practices for next season',
  'Nearby farmers',
  'km away',
  'Save to farm log',
  'Saved to your farm log',
  'Share with officer',
  'Sent to your block agriculture officer',
  'Offline',
  'Saved for offline use',
  'Treatment.',
]

export default function ResultPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const { data: result, isLoading } = useSWR(id ? ['diagnosis', id] : null, () =>
    getDiagnosis(id as string),
  )
  const [saving, setSaving] = React.useState(false)
  const [sharing, setSharing] = React.useState(false)
  const { lang } = useLanguage()
  const translation = useTranslatedDiagnosis(result, lang)
  const { speak, stop, speaking, loading: speechLoading, unavailable: voiceUnavailable } = useSpeech()
  const t = useLiveText(PAGE_STRINGS)
  const tc = useLiveText(result ? [result.crop, result.disease] : [])
  const to = useLiveText(result ? result.similarCases.map((c) => c.outcome) : [])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 pt-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="aspect-video w-full rounded-3xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    )
  }

  if (!result) {
    return (
      <Empty className="mt-10">
        <EmptyHeader>
          <EmptyTitle>{t('Diagnosis not found')}</EmptyTitle>
          <EmptyDescription>
            {t('This scan may have been removed from your device. Try scanning the leaf again.')}
          </EmptyDescription>
        </EmptyHeader>
        <Button render={<Link href="/scan" />}>{t('Scan a leaf')}</Button>
      </Empty>
    )
  }

  const diagnosis = result
  const shown = translation.data ?? result

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveScan(diagnosis)
      toast.success(t('Saved to your farm log'))
    } finally {
      setSaving(false)
    }
  }

  const handleShare = async () => {
    setSharing(true)
    try {
      await shareWithOfficer(diagnosis.id)
      toast.success(t('Sent to your block agriculture officer'))
    } finally {
      setSharing(false)
    }
  }

  const handleListen = () => {
    if (speaking) {
      stop()
      return
    }
    const speech = [
      shown.disease,
      shown.overview,
      t('Treatment.'),
      ...shown.treatment.organic.map((s) => s.detail),
    ].join(' ')
    speak(speech, lang)
  }

  return (
    <div className="flex flex-col gap-7">
      <Link
        href="/history"
        className="inline-flex w-fit items-center gap-1.5 pt-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t('Back to farm log')}
      </Link>

      {/* Diagnosis header */}
      <section className="flex flex-col gap-4">
        <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-muted">
          <Image
            src={shown.imageUrl || '/placeholder.svg'}
            alt={`${shown.crop} leaf diagnosed with ${shown.disease}`}
            fill
            sizes="(min-width: 1024px) 640px, 100vw"
            className="object-cover"
            unoptimized={shown.imageUrl.startsWith('blob:')}
            priority
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              {tc(shown.crop)}
            </span>
            <SeverityBadge
              severity={shown.severity}
              className="bg-background/90 backdrop-blur-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl leading-tight font-semibold tracking-tight text-balance">
              {tc(shown.disease)}
            </h1>
            {shown.source && (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  shown.source === 'live'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {shown.source === 'live' ? t('Live AI result') : t('Demo data')}
              </span>
            )}
          </div>
          <p className="font-mono text-sm text-muted-foreground italic">
            {shown.scientificName}
          </p>
          {translation.unavailable && (
            <p className="text-xs text-muted-foreground">
              {t('Translation unavailable right now — showing English.')}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium">{t('Model confidence')}</span>
            <span className="font-display text-2xl font-semibold text-primary">
              {shown.confidence}%
            </span>
          </div>
          <Progress value={shown.confidence} />
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t('Based on leaf pattern matching. Confirm with your Krishi Vigyan Kendra before large-scale spraying.')}
          </p>
        </div>

        <p className="text-base leading-relaxed text-pretty">
          {shown.overview}
        </p>

        <Button
          variant="outline"
          size="lg"
          onClick={handleListen}
          disabled={translation.translating || speechLoading}
          className="min-h-12 w-fit"
        >
          {speaking ? (
            <>
              <Square data-icon="inline-start" />
              {t('Stop')}
            </>
          ) : translation.translating ? (
            <>
              <Volume2 data-icon="inline-start" />
              {t('Translating…')}
            </>
          ) : speechLoading ? (
            <>
              <Volume2 data-icon="inline-start" />
              {t('Preparing audio…')}
            </>
          ) : (
            <>
              <Volume2 data-icon="inline-start" />
              {t('Listen in my language')}
            </>
          )}
        </Button>
        {voiceUnavailable && (
          <p className="text-xs text-muted-foreground">
            {t('Voice not available for this language yet — try Hindi, Marathi, or another supported language.')}
          </p>
        )}
      </section>

      {/* Symptoms */}
      <section aria-labelledby="symptoms-heading" className="flex flex-col gap-3">
        <h2
          id="symptoms-heading"
          className="font-display text-xl font-semibold tracking-tight"
        >
          {t('What to look for')}
        </h2>
        <ul className="flex flex-col gap-2">
          {shown.symptoms.map((symptom) => (
            <li
              key={symptom}
              className="flex items-start gap-3 rounded-xl bg-muted px-4 py-3 text-sm leading-relaxed"
            >
              <span
                aria-hidden="true"
                className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
              />
              {symptom}
            </li>
          ))}
        </ul>
      </section>

      {/* Treatment */}
      <section aria-labelledby="treatment-heading" className="flex flex-col gap-3">
        <h2
          id="treatment-heading"
          className="font-display text-xl font-semibold tracking-tight"
        >
          {t('Treatment plan')}
        </h2>
        <WeatherAdvisory />
        <TreatmentPlan plan={shown.treatment} />
      </section>

      {/* Prevention */}
      <section aria-labelledby="prevention-heading" className="flex flex-col gap-3">
        <h2
          id="prevention-heading"
          className="font-display text-xl font-semibold tracking-tight"
        >
          {t('Stop it coming back')}
        </h2>
        <Accordion className="rounded-2xl border border-border bg-card px-4">
          <AccordionItem value="prevention">
            <AccordionTrigger className="text-base">
              {shown.prevention.length} {t('preventive practices for next season')}
            </AccordionTrigger>
            <AccordionContent>
              <ul className="flex flex-col gap-2.5">
                {shown.prevention.map((tip) => (
                  <li key={tip} className="flex items-start gap-3 text-sm leading-relaxed">
                    <ShieldPlus
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    {tip}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Similar cases nearby */}
      {shown.similarCases.length > 0 && (
        <section aria-labelledby="cases-heading" className="flex flex-col gap-3">
          <h2
            id="cases-heading"
            className="font-display text-xl font-semibold tracking-tight"
          >
            {t('Nearby farmers')}
          </h2>
          <div className="flex flex-col gap-2.5">
            {shown.similarCases.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-1.5 rounded-2xl border border-border bg-card p-4"
              >
                <p className="inline-flex items-center gap-1.5 text-sm font-semibold">
                  <MapPin className="size-4 text-primary" aria-hidden="true" />
                  {item.village}
                  <span className="font-normal text-muted-foreground">
                    · {item.distanceKm} {t('km away')}
                  </span>
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {to(item.outcome)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Follow-up chat */}
      <FollowUpChat crop={shown.crop} disease={shown.disease} />

      {/* Actions */}
      <section className="flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          onClick={handleSave}
          disabled={saving}
          className="min-h-14 flex-1 text-base"
        >
          <BookmarkCheck data-icon="inline-start" />
          {t('Save to farm log')}
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={handleShare}
          disabled={sharing}
          className="min-h-14 flex-1 text-base"
        >
          <Send data-icon="inline-start" />
          {t('Share with officer')}
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => toast.success(t('Saved for offline use'))}
          className="min-h-14 text-base"
        >
          <Download data-icon="inline-start" />
          {t('Offline')}
        </Button>
      </section>
    </div>
  )
}
