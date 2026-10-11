'use client'

import useSWR from 'swr'
import { CloudOff, Gauge, LifeBuoy, MapPin, Phone, Sprout } from 'lucide-react'
import { toast } from 'sonner'

import { LanguageToggle } from '@/components/language-toggle'
import { useLiveText } from '@/lib/use-live-text'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { getProfile, updateProfile } from '@/lib/api'

const PAGE_STRINGS = [
  'Profile',
  'Farm details',
  'Land size',
  'acres',
  'Crops',
  'Preferences',
  'Offline mode',
  'Keep diagnoses and treatment plans on this phone.',
  'Data saver',
  'Compress photos before upload on 2G/3G networks.',
  'Language',
  'Diagnoses and voice playback use this language.',
  'Help',
  'Severe or spreading outbreaks should always be confirmed with a local expert before you spray across the whole field.',
  'Kisan Call Centre',
  'Calling the Kisan Call Centre…',
  'Block officer',
  'Your block officer will be notified',
]

export default function ProfilePage() {
  const t = useLiveText(PAGE_STRINGS)
  const { data: profile, mutate } = useSWR('profile', getProfile)
  const tc = useLiveText(profile?.crops ?? [])

  if (!profile) {
    return (
      <div className="flex flex-col gap-4 pt-2">
        <Skeleton className="h-24 w-full rounded-3xl" />
        <Skeleton className="h-40 w-full rounded-3xl" />
        <Skeleton className="h-32 w-full rounded-3xl" />
      </div>
    )
  }

  async function toggle(key: 'offlineMode' | 'dataSaver', value: boolean) {
    const updated = await updateProfile({ [key]: value })
    mutate(updated, { revalidate: false })
  }

  const initials = profile.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 pt-2">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {t('Profile')}
        </h1>
      </header>

      {/* Identity */}
      <section className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5">
        <Avatar className="size-16">
          <AvatarFallback className="bg-primary font-display text-lg font-semibold text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="font-display text-xl leading-tight font-semibold">
            {profile.name}
          </p>
          <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4" aria-hidden="true" />
            {profile.village}, {profile.district}, {profile.state}
          </p>
        </div>
      </section>

      {/* Farm details */}
      <section className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          {t('Farm details')}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs tracking-wide text-muted-foreground uppercase">
              {t('Land size')}
            </span>
            <span className="font-display text-2xl font-semibold">
              {profile.landSizeAcres}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                {t('acres')}
              </span>
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs tracking-wide text-muted-foreground uppercase">
              {t('Crops')}
            </span>
            <span className="font-display text-2xl font-semibold">
              {profile.crops.length}
            </span>
          </div>
        </div>
        <Separator />
        <div className="flex flex-wrap gap-2">
          {profile.crops.map((crop) => (
            <span
              key={crop}
              className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground"
            >
              <Sprout className="size-3.5" aria-hidden="true" />
              {tc(crop)}
            </span>
          ))}
        </div>
      </section>

      {/* Preferences */}
      <section className="rounded-3xl border border-border bg-card p-5">
        <FieldSet>
          <FieldLegend>{t('Preferences')}</FieldLegend>
          <FieldGroup>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="offline" className="flex-1">
                <span className="flex items-center gap-2">
                  <CloudOff className="size-4 text-primary" aria-hidden="true" />
                  {t('Offline mode')}
                </span>
                <FieldDescription>
                  {t('Keep diagnoses and treatment plans on this phone.')}
                </FieldDescription>
              </FieldLabel>
              <Switch
                id="offline"
                checked={profile.offlineMode}
                onCheckedChange={(checked) => toggle('offlineMode', checked)}
              />
            </Field>

            <Field orientation="horizontal">
              <FieldLabel htmlFor="data-saver" className="flex-1">
                <span className="flex items-center gap-2">
                  <Gauge className="size-4 text-primary" aria-hidden="true" />
                  {t('Data saver')}
                </span>
                <FieldDescription>
                  {t('Compress photos before upload on 2G/3G networks.')}
                </FieldDescription>
              </FieldLabel>
              <Switch
                id="data-saver"
                checked={profile.dataSaver}
                onCheckedChange={(checked) => toggle('dataSaver', checked)}
              />
            </Field>

            <Field orientation="horizontal">
              <FieldLabel className="flex-1">
                {t('Language')}
                <FieldDescription>
                  {t('Diagnoses and voice playback use this language.')}
                </FieldDescription>
              </FieldLabel>
              <LanguageToggle />
            </Field>
          </FieldGroup>
        </FieldSet>
      </section>

      {/* Support */}
      <section className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          {t('Help')}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t('Severe or spreading outbreaks should always be confirmed with a local expert before you spray across the whole field.')}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            size="lg"
            className="min-h-12 flex-1"
            onClick={() => toast.success(t('Calling the Kisan Call Centre…'))}
          >
            <Phone data-icon="inline-start" />
            {t('Kisan Call Centre')}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="min-h-12 flex-1"
            onClick={() => toast.info(t('Your block officer will be notified'))}
          >
            <LifeBuoy data-icon="inline-start" />
            {t('Block officer')}
          </Button>
        </div>
      </section>
    </div>
  )
}
