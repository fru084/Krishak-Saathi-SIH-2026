import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Manrope } from 'next/font/google'

import { AppShell } from '@/components/app-shell'
import { LanguageProvider } from '@/components/language-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const _manrope = Manrope({ subsets: ['latin'] })
const _bricolage = Bricolage_Grotesque({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Krishak Saathi — AI Crop Disease Detection',
  description:
    'Photograph a crop leaf and get an instant disease diagnosis with organic and chemical treatment plans, in your own language.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#2c5f2d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        <LanguageProvider>
          <AppShell>{children}</AppShell>
          <Toaster position="top-center" />
        </LanguageProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
