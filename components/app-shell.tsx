'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Camera, ClipboardList, House, Leaf, User } from 'lucide-react'

import { ConnectivityIndicator } from '@/components/connectivity-indicator'
import { LanguageToggle } from '@/components/language-toggle'
import { useLiveText } from '@/lib/use-live-text'
import { cn } from '@/lib/utils'

const navItems: {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { href: '/', label: 'Home', icon: House },
  { href: '/scan', label: 'Scan', icon: Camera },
  { href: '/history', label: 'History', icon: ClipboardList },
  { href: '/profile', label: 'Profile', icon: User },
]

const SHELL_STRINGS = [
  'Your crop doctor in your pocket',
  'Diagnoses are advisory. For severe outbreaks, confirm with your Krishi Vigyan Kendra.',
  ...navItems.map((i) => i.label),
]

function useIsActive() {
  const pathname = usePathname()
  return (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useLiveText(SHELL_STRINGS)
  const isActive = useIsActive()

  return (
    <div className="min-h-dvh lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-8 border-r border-border bg-card px-5 py-7 lg:flex">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Leaf className="size-6" aria-hidden="true" />
          </span>
          <span className="flex flex-col">
            <span className="font-display text-lg leading-tight font-semibold">
              Krishak Saathi
            </span>
            <span className="text-xs text-muted-foreground">{t('Your crop doctor in your pocket')}</span>
          </span>
        </Link>

        <nav aria-label="Main" className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
                  active
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {t(item.label)}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-3">
          <ConnectivityIndicator className="self-start" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t('Diagnoses are advisory. For severe outbreaks, confirm with your Krishi Vigyan Kendra.')}
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile / tablet header */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 py-3">
            <Link href="/" className="flex items-center gap-2.5 lg:hidden">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Leaf className="size-5" aria-hidden="true" />
              </span>
              <span className="font-display text-base leading-tight font-semibold">
                Krishak Saathi
              </span>
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <ConnectivityIndicator className="hidden sm:inline-flex lg:hidden" />
              <LanguageToggle />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-4 pb-28 lg:pb-10">
          {children}
        </main>

        {/* Mobile bottom navigation */}
        <nav
          aria-label="Main"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
        >
          <ul className="mx-auto flex max-w-4xl items-stretch">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <li key={item.href} className="flex-1">
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex min-h-14 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors',
                      active
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-7 w-12 items-center justify-center rounded-full transition-colors',
                        active && 'bg-secondary',
                      )}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    {t(item.label)}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>
  )
}
