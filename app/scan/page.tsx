'use client'

import * as React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Camera, ImagePlus, Info, ScanLine, Sun, TriangleAlert, X } from 'lucide-react'
import { toast } from 'sonner'

import { checkImageQuality, type QualityIssue } from '@/lib/image-quality'
import { useLiveText } from '@/lib/use-live-text'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { CROP_OPTIONS, diagnoseCrop } from '@/lib/api'

const tips = [
  { icon: Sun, text: 'Shoot in daylight, avoid harsh shadows' },
  { icon: ScanLine, text: 'Fill the frame with one affected leaf' },
  { icon: Info, text: 'Include both healthy and damaged parts' },
]

const PAGE_STRINGS = [
  'Scan Crop',
  'Photograph a leaf and get a diagnosis in seconds',
  'Matching against 40,000 field images…',
  'Remove photo',
  'Point at the affected leaf',
  'Hold steady about one hand-span away from the leaf.',
  'Take photo',
  'From gallery',
  'Crop',
  'Select the crop (optional)',
  'Naming the crop narrows the diagnosis, but the model can work it out on its own.',
  'Analysing…',
  'Diagnose now',
  'For an accurate result',
  'Could not analyse the photo. Please try again.',
  'This photo looks quite dark — try again in better light for a more accurate diagnosis.',
  'This photo looks washed out or overexposed — try again out of direct glare.',
  'This photo looks a little blurry — hold the camera steady and make sure the leaf is in focus.',
  ...tips.map((tip) => tip.text),
]

export default function ScanPage() {
  const router = useRouter()
  const t = useLiveText(PAGE_STRINGS)
  const tc = useLiveText([...CROP_OPTIONS])
  // Crop names deliberately not machine-translated — see note in scan-card.tsx.

  const cameraRef = React.useRef<HTMLInputElement>(null)
  const galleryRef = React.useRef<HTMLInputElement>(null)

  const [file, setFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [crop, setCrop] = React.useState<string>('')
  const [analyzing, setAnalyzing] = React.useState(false)
  const [qualityIssues, setQualityIssues] = React.useState<QualityIssue[]>([])

  React.useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]
    if (!selected) return
    if (preview) URL.revokeObjectURL(preview)
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
    setQualityIssues([])
    checkImageQuality(selected).then(setQualityIssues)
  }

  function clearFile() {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview(null)
    setQualityIssues([])
    if (cameraRef.current) cameraRef.current.value = ''
    if (galleryRef.current) galleryRef.current.value = ''
  }

  async function handleAnalyze() {
    if (!file) return
    setAnalyzing(true)
    try {
      const result = await diagnoseCrop(file)
      router.push(`/result/${result.id}`)
    } catch (error) {
      console.log('[v0] diagnoseCrop failed:', error)
      toast.error(t('Could not analyse the photo. Please try again.'))
      setAnalyzing(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 pt-2">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {t('Scan Crop')}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t('Photograph a leaf and get a diagnosis in seconds')}
        </p>
      </header>

      {/* Capture surface */}
      <div className="relative aspect-4/5 w-full overflow-hidden rounded-3xl border border-border bg-card sm:aspect-video">
        {preview ? (
          <>
            <Image
              src={preview || '/placeholder.svg'}
              alt="Selected crop leaf photo"
              fill
              sizes="(min-width: 1024px) 640px, 100vw"
              className="object-cover"
              unoptimized
            />
            {analyzing ? (
              <div className="absolute inset-0 bg-foreground/45">
                <div
                  aria-hidden="true"
                  className="animate-scanline absolute inset-x-0 h-24 bg-linear-to-b from-transparent via-accent/70 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-foreground/60 px-5 py-4 text-background backdrop-blur-sm">
                  <Spinner className="size-5" />
                  <span className="text-sm font-medium">
                    {t('Matching against 40,000 field images…')}
                  </span>
                </div>
              </div>
            ) : (
              <Button
                variant="secondary"
                size="icon"
                onClick={clearFile}
                aria-label={t("Remove photo")}
                className="absolute top-3 right-3 rounded-full"
              >
                <X />
              </Button>
            )}
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
            <span
              aria-hidden="true"
              className="flex size-24 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
            >
              <Camera className="size-11" />
            </span>
            <div className="flex flex-col gap-1">
              <p className="font-display text-lg font-semibold">
                {t('Point at the affected leaf')}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t('Hold steady about one hand-span away from the leaf.')}
              </p>
            </div>
          </div>
        )}
      </div>

      {!analyzing && qualityIssues.length > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          {qualityIssues.map((issue) => (
            <p
              key={issue.code}
              className="flex items-start gap-2 text-sm leading-relaxed text-amber-700"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {t(issue.message)}
            </p>
          ))}
        </div>
      )}

      {/* Hidden inputs */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      <div className="grid grid-cols-2 gap-3">
        <Button
          size="lg"
          onClick={() => cameraRef.current?.click()}
          disabled={analyzing}
          className="min-h-14 text-base"
        >
          <Camera data-icon="inline-start" />
          {t('Take photo')}
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => galleryRef.current?.click()}
          disabled={analyzing}
          className="min-h-14 text-base"
        >
          <ImagePlus data-icon="inline-start" />
          {t('From gallery')}
        </Button>
      </div>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="crop">{t('Crop')}</FieldLabel>
          <Select
            value={crop}
            onValueChange={(value) => setCrop(String(value ?? ''))}
          >
            <SelectTrigger id="crop" className="min-h-12 w-full">
              <SelectValue placeholder={t('Select the crop (optional)')} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {CROP_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {tc(option)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldDescription>
            {t('Naming the crop narrows the diagnosis, but the model can work it out on its own.')}
          </FieldDescription>
        </Field>
      </FieldGroup>

      <Button
        size="lg"
        onClick={handleAnalyze}
        disabled={!file || analyzing}
        className="min-h-14 text-base"
      >
        {analyzing ? (
          <>
            <Spinner data-icon="inline-start" />
            {t('Analysing…')}
          </>
        ) : (
          <>
            <ScanLine data-icon="inline-start" />
            {t('Diagnose now')}
          </>
        )}
      </Button>

      <section aria-labelledby="tips-heading" className="flex flex-col gap-3">
        <h2
          id="tips-heading"
          className="font-display text-base font-semibold tracking-tight"
        >
          {t('For an accurate result')}
        </h2>
        <ul className="flex flex-col gap-2">
          {tips.map((tip) => {
            const Icon = tip.icon
            return (
              <li
                key={tip.text}
                className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3 text-sm"
              >
                <Icon
                  className="size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                {t(tip.text)}
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
