'use client'

import Link from 'next/link'
import useSWR from 'swr'
import {
  BookOpen,
  Camera,
  ChevronRight,
  CloudOff,
  Droplets,
  MapPin,
  ScanLine,
  Sprout,
  Users,
} from 'lucide-react'

import { useLiveText } from '@/lib/use-live-text'
import { ScanCard } from '@/components/scan-card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { getProfile, getRecentScans } from '@/lib/api'

const quickLinks = [
  {
    href: '/history',
    label: 'My Farm',
    description: 'Every scan, treatment and outcome',
    icon: Sprout,
  },
  {
    href: '/history',
    label: 'Treatment Library',
    description: 'Organic and chemical schedules',
    icon: BookOpen,
  },
  {
    href: '/history',
    label: 'Community Tips',
    description: 'What worked in nearby villages',
    icon: Users,
  },
  {
    href: '/profile',
    label: 'Help',
    description: 'Contact your block officer',
    icon: Droplets,
  },
]

const PAGE_STRINGS = [
  'Namaste',
  'Your crop doctor in your pocket',
  'Scan Crop',
  'Photograph a leaf and get a diagnosis in seconds',
  'Open camera',
  'Works without a signal',
  'Photos taken offline are queued on your phone and diagnosed automatically once the network returns.',
  'Recent Scans',
  'View all',
  'Quick access',
  ...quickLinks.map((l) => l.label),
  ...quickLinks.map((l) => l.description),
]

export default function HomePage() {
  const t = useLiveText(PAGE_STRINGS)
  const { data: profile } = useSWR('profile', getProfile)
  const { data: scans, isLoading } = useSWR('recent-scans', () =>
    getRecentScans(3),
  )

  return (
    <div className="flex flex-col gap-8">
      {/* Greeting */}
      <section className="flex flex-col gap-1 pt-2">
        <p className="text-sm text-muted-foreground">
          {t('Namaste')}
          {profile ? `, ${profile.name.split(' ')[0]}` : ''}
        </p>
        <h1 className="font-display text-3xl leading-tight font-semibold tracking-tight text-balance">
          {t('Your crop doctor in your pocket')}
        </h1>
        {profile && (
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4" aria-hidden="true" />
            {profile.village}, {profile.district} · {profile.landSizeAcres} acres
          </p>
        )}
      </section>

      {/* Primary scan action */}
      <section aria-labelledby="scan-heading">
        <Link
          href="/scan"
          className="group relative block overflow-hidden rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform active:scale-[0.99]"
        >
          <div
            aria-hidden="true"
            className="absolute -top-16 -right-10 size-56 rounded-full bg-accent/25 blur-2xl"
          />
          <div className="relative flex items-center gap-5 p-6 sm:p-8">
            <span className="flex size-20 shrink-0 items-center justify-center rounded-3xl bg-primary-foreground/12 ring-1 ring-primary-foreground/20 sm:size-24">
              <Camera className="size-10 sm:size-12" aria-hidden="true" />
            </span>
            <span className="flex min-w-0 flex-col gap-1.5">
              <span
                id="scan-heading"
                className="font-display text-2xl leading-tight font-semibold sm:text-3xl"
              >
                {t('Scan Crop')}
              </span>
              <span className="text-sm leading-relaxed text-primary-foreground/80">
                {t('Photograph a leaf and get a diagnosis in seconds')}
              </span>
              <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold">
                <ScanLine className="size-4" aria-hidden="true" />
                {t('Open camera')}
                <ChevronRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </span>
          </div>
        </Link>
      </section>

      {/* Offline notice */}
      <Alert>
        <CloudOff />
        <AlertTitle>{t('Works without a signal')}</AlertTitle>
        <AlertDescription>
          {t('Photos taken offline are queued on your phone and diagnosed automatically once the network returns.')}
        </AlertDescription>
      </Alert>

      {/* Recent scans */}
      <section aria-labelledby="recent-heading" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-4">
          <h2
            id="recent-heading"
            className="font-display text-xl font-semibold tracking-tight"
          >
            {t('Recent Scans')}
          </h2>
          <Link
            href="/history"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {t('View all')}
          </Link>
        </div>

        <div className="flex flex-col gap-2.5">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
                >
                  <Skeleton className="size-16 rounded-xl" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))
            : scans?.map((scan) => <ScanCard key={scan.id} scan={scan} />)}
        </div>
      </section>

      {/* Quick access */}
      <section aria-labelledby="quick-heading" className="flex flex-col gap-3">
        <h2
          id="quick-heading"
          className="font-display text-xl font-semibold tracking-tight"
        >
          {t('Quick access')}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.label}
                href={link.href}
                className="flex min-h-32 flex-col gap-2 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-accent"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="mt-auto font-display text-base font-semibold">
                  {t(link.label)}
                </span>
                <span className="text-xs leading-relaxed text-muted-foreground">
                  {t(link.description)}
                </span>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
