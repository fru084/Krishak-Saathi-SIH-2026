'use client'

import { Leaf, ShieldCheck, SprayCan, TriangleAlert } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLiveText } from '@/lib/use-live-text'
import type { TreatmentPlan as TreatmentPlanType, TreatmentStep } from '@/lib/types'

const LABELS = [
  'Organic',
  'Chemical',
  'Start here. Low cost, safe near livestock and children, and it keeps your produce residue-free.',
]

function StepList({ steps }: { steps: TreatmentStep[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {steps.map((step) => (
        <li
          key={step.step}
          className="flex gap-3 rounded-2xl border border-border bg-card p-4"
        >
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-sm font-semibold text-secondary-foreground"
          >
            {step.step}
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <p className="font-display text-base font-semibold">{step.title}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {step.detail}
            </p>
            {step.input && (
              <p className="mt-1 w-fit rounded-lg bg-muted px-2.5 py-1 font-mono text-xs text-foreground">
                {step.input}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}

export function TreatmentPlan({ plan }: { plan: TreatmentPlanType }) {
  const t = useLiveText(LABELS)

  return (
    <Tabs defaultValue="organic" className="gap-4">
      <TabsList className="w-full">
        <TabsTrigger value="organic" className="flex-1">
          <Leaf data-icon="inline-start" />
          {t('Organic')}
        </TabsTrigger>
        <TabsTrigger value="chemical" className="flex-1">
          <SprayCan data-icon="inline-start" />
          {t('Chemical')}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="organic" className="flex flex-col gap-3">
        <p className="flex items-start gap-2 rounded-xl bg-secondary px-4 py-3 text-sm leading-relaxed text-secondary-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {t('Start here. Low cost, safe near livestock and children, and it keeps your produce residue-free.')}
        </p>
        <StepList steps={plan.organic} />
      </TabsContent>

      <TabsContent value="chemical" className="flex flex-col gap-3">
        <p className="flex items-start gap-2 rounded-xl bg-severity-high/10 px-4 py-3 text-sm leading-relaxed text-severity-high">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {plan.safetyNote}
        </p>
        <StepList steps={plan.chemical} />
      </TabsContent>
    </Tabs>
  )
}
