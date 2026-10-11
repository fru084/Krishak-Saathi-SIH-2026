'use client'

import * as React from 'react'
import { Wifi, WifiOff } from 'lucide-react'

import { useLiveText } from '@/lib/use-live-text'
import { cn } from '@/lib/utils'

export function ConnectivityIndicator({ className }: { className?: string }) {
  const t = useLiveText(['Online', 'Offline'])
  const [online, setOnline] = React.useState(true)

  React.useEffect(() => {
    setOnline(navigator.onLine)
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        online
          ? 'bg-secondary text-secondary-foreground'
          : 'bg-soil/15 text-soil',
        className,
      )}
    >
      {online ? (
        <Wifi className="size-3.5" aria-hidden="true" />
      ) : (
        <WifiOff className="size-3.5" aria-hidden="true" />
      )}
      {online ? t('Online') : t('Offline')}
    </span>
  )
}
