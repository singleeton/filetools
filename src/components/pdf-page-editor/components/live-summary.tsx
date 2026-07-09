'use client'

import { formatFileSize } from '@/utils/file-validation'

export interface LiveSummaryLabels {
  selectedCount: string
  outputCount: string
  estimatedSize: string
}

interface LiveSummaryProps {
  selectedCount: number
  outputCount: number
  estimatedSizeBytes: number
  labels: LiveSummaryLabels
}

export function LiveSummary({ selectedCount, outputCount, estimatedSizeBytes, labels }: LiveSummaryProps) {
  const stats: [string, string][] = [
    [labels.selectedCount, String(selectedCount)],
    [labels.outputCount, String(outputCount)],
    [labels.estimatedSize, `~${formatFileSize(estimatedSizeBytes)}`],
  ]

  return (
    <div className="grid grid-cols-3 gap-3 rounded-lg border bg-card p-4 text-center">
      {stats.map(([label, value]) => (
        <div key={label}>
          <div className="text-lg font-semibold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      ))}
    </div>
  )
}
