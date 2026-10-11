'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import { SeverityBadge, StatusBadge } from '@/components/severity-badge'
import type { ScanRecord } from '@/lib/types'
import { useLiveText } from '@/lib/use-live-text'
import { cn } from '@/lib/utils'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function ScanCard({
  scan,
  className,
}: {
  scan: ScanRecord
  className?: string
}) {
  const t = useLiveText([scan.crop, scan.disease])
  return (
    <Link
      href={`/result/${scan.resultId}`}
      className={cn(
        'group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-accent',
        className,
      )}
    >
      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
        <Image
          src={scan.imageUrl || '/placeholder.svg'}
          alt={`${scan.crop} leaf showing ${scan.disease}`}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t(scan.crop)}
          </span>
          <StatusBadge status={scan.status} />
        </div>
        <p className="truncate font-display text-base font-semibold">
          {t(scan.disease)}
        </p>
        <div className="flex items-center gap-2">
          <SeverityBadge severity={scan.severity} />
          <span className="text-xs text-muted-foreground">
            {formatDate(scan.date)}
          </span>
        </div>
      </div>
      <ChevronRight
        className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  )
}
