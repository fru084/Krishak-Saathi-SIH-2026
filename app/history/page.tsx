'use client'

import * as React from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { ClipboardList, Search } from 'lucide-react'

import { ScanCard } from '@/components/scan-card'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { getScans } from '@/lib/api'
import { useLiveText } from '@/lib/use-live-text'
import type { Severity } from '@/lib/types'

const filters = ['All', 'Low', 'Medium', 'High'] as const
type Filter = (typeof filters)[number]

const PAGE_STRINGS = [
  'My Farm',
  'Scan Crop',
  'scans recorded. Tap any entry to reopen its treatment plan.',
  'Search crop or disease',
  'No scans match',
  'Change the filter, or photograph a leaf to add your first entry.',
  'All',
  'Low',
  'Medium',
  'High',
]

export default function HistoryPage() {
  const tt = useLiveText(PAGE_STRINGS)
  const { data: scans, isLoading } = useSWR('scans', getScans)
  const [filter, setFilter] = React.useState<Filter>('All')
  const [query, setQuery] = React.useState('')

  const visible = (scans ?? []).filter((scan) => {
    const matchesFilter =
      filter === 'All' || scan.severity === (filter as Severity)
    const haystack = `${scan.crop} ${scan.disease}`.toLowerCase()
    return matchesFilter && haystack.includes(query.trim().toLowerCase())
  })

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 pt-2">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {tt('My Farm')}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {scans?.length ?? 0} {tt('scans recorded. Tap any entry to reopen its treatment plan.')}
        </p>
      </header>

      <div className="flex flex-col gap-3">
        <InputGroup>
          <InputGroupInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={tt('Search crop or disease')}
            aria-label="Search scans"
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>

        <ToggleGroup
          value={[filter]}
          onValueChange={(value) => {
            const next = value[0] as Filter | undefined
            if (next) setFilter(next)
          }}
          aria-label="Filter by severity"
          className="w-full rounded-full bg-muted p-1"
        >
          {filters.map((option) => (
            <ToggleGroupItem
              key={option}
              value={option}
              className="min-h-10 flex-1 rounded-full text-sm font-medium data-pressed:bg-card"
            >
              {tt(option)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-22 w-full rounded-2xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <Empty className="rounded-3xl border border-border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardList />
            </EmptyMedia>
            <EmptyTitle>{tt('No scans match')}</EmptyTitle>
            <EmptyDescription>
              {tt('Change the filter, or photograph a leaf to add your first entry.')}
            </EmptyDescription>
          </EmptyHeader>
          <Button render={<Link href="/scan" />}>{tt('Scan Crop')}</Button>
        </Empty>
      ) : (
        <div className="flex flex-col gap-2.5">
          {visible.map((scan) => (
            <ScanCard key={scan.id} scan={scan} />
          ))}
        </div>
      )}
    </div>
  )
}
