'use client'

import { Loader2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { useDictionary } from '@/lib/i18n/dictionary-context'

interface ProcessingStatusProps {
  progress: number
  message?: string
}

export function ProcessingStatus({
  progress,
  message,
}: ProcessingStatusProps) {
  const { dict } = useDictionary()

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border bg-card p-8">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <div className="w-full max-w-xs text-center">
        <p className="mb-3 text-sm font-medium">
          {message || dict.ui.processing.default}
        </p>
        <Progress value={progress} className="h-2" />
        <p className="mt-2 text-xs text-muted-foreground">{progress}%</p>
      </div>
    </div>
  )
}
