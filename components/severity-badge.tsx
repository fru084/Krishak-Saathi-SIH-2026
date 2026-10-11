'use client'

import { useLiveText } from '@/lib/use-live-text'
import { cn } from '@/lib/utils'
import type { ScanStatus, Severity } from '@/lib/types'

const severityStyles: Record<Severity, string> = {
  Low: 'bg-severity-low/12 text-severity-low ring-severity-low/25',
  Medium: 'bg-severity-medium/12 text-severity-medium ring-severity-medium/25',
  High: 'bg-severity-high/12 text-severity-high ring-severity-high/25',
}

const statusStyles: Record<ScanStatus, string> = {
  Treated: 'bg-secondary text-secondary-foreground',
  Monitoring: 'bg-soil/12 text-soil',
  Resolved: 'bg-muted text-muted-foreground',
}

const LABELS: (Severity | ScanStatus)[] = ['Low', 'Medium', 'High', 'Treated', 'Monitoring', 'Resolved']

export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity
  className?: string
}) {
  const t = useLiveText(LABELS)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        severityStyles[severity],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {t(severity)}
    </span>
  )
}

export function StatusBadge({
  status,
  className,
}: {
  status: ScanStatus
  className?: string
}) {
  const t = useLiveText(LABELS)
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        statusStyles[status],
        className,
      )}
    >
      {t(status)}
    </span>
  )
}
