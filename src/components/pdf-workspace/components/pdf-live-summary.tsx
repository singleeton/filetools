'use client'

import { formatFileSize } from '@/utils/file-validation'
import type { WorkspaceTool } from '../types'

export interface PdfLiveSummaryLabels {
  selectedPages: string
  outputFiles: string
  estimatedSize: string
  currentMode: string
  modeNames: Record<WorkspaceTool, string>
}

interface PdfLiveSummaryProps {
  selectedCount: number
  outputCount: number
  estimatedSizeBytes: number
  activeTool: WorkspaceTool
  labels: PdfLiveSummaryLabels
}

export function PdfLiveSummary({ selectedCount, outputCount, estimatedSizeBytes, activeTool, labels }: PdfLiveSummaryProps) {
  const stats: [string, string][] = [
    [labels.selectedPages, String(selectedCount)],
    [labels.outputFiles, String(outputCount)],
    [labels.estimatedSize, `~${formatFileSize(estimatedSizeBytes)}`],
  ]

  return (
    <div className="space-y-2 rounded-lg border bg-card p-3 text-sm">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{labels.currentMode}</span>
        <span className="font-medium text-foreground">{labels.modeNames[activeTool]}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {stats.map(([label, value]) => (
          <div key={label}>
            <div className="text-base font-semibold">{value}</div>
            <div className="text-[11px] text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
