'use client'

import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProcessingPhase } from '@/hooks/use-multi-file-tool-execution'

export interface ProcessingStepsLabels {
  reading: string
  preparing: string
  creating: string
  done: string
}

const ORDER: ProcessingPhase[] = ['reading', 'preparing', 'creating', 'done']

interface ProcessingStepsProps {
  phase: ProcessingPhase
  labels: ProcessingStepsLabels
}

export function ProcessingSteps({ phase, labels }: ProcessingStepsProps) {
  const currentIndex = ORDER.indexOf(phase)

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 py-8">
      {ORDER.map((step, i) => {
        const state = i < currentIndex ? 'done' : i === currentIndex ? 'active' : 'pending'
        return (
          <div key={step} className="flex items-center gap-3">
            <div
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors',
                state === 'done' && 'border-primary bg-primary text-primary-foreground',
                state === 'active' && 'border-primary text-primary',
                state === 'pending' && 'border-border text-muted-foreground',
              )}
            >
              {state === 'done' ? (
                <Check className="size-4" />
              ) : state === 'active' ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                i + 1
              )}
            </div>
            <span className={cn('text-sm', state === 'pending' ? 'text-muted-foreground' : 'font-medium')}>
              {labels[step]}
            </span>
          </div>
        )
      })}
    </div>
  )
}
