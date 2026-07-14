'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isFitMode } from '../hooks/use-pdf-zoom'
import type { ZoomValue } from '../types'

export interface PdfStatusBarLabels {
  totalPages: string
  selected: string
  zoom: string
  ready: string
  processing: string
}

interface PdfStatusBarProps {
  totalPages: number
  selectedCount: number
  zoom: ZoomValue
  isProcessing?: boolean
  labels: PdfStatusBarLabels
}

export function PdfStatusBar({ totalPages, selectedCount, zoom, isProcessing, labels }: PdfStatusBarProps) {
  return (
    <footer className="flex h-8 shrink-0 items-center gap-4 border-t bg-background px-4 text-xs text-muted-foreground">
      <span>
        {labels.totalPages}: <strong className="font-medium text-foreground">{totalPages}</strong>
      </span>
      <span>
        {labels.selected}: <strong className="font-medium text-foreground">{selectedCount}</strong>
      </span>
      <span>
        {labels.zoom}: <strong className="font-medium text-foreground">{isFitMode(zoom) ? zoom : `${zoom}%`}</strong>
      </span>
      <div className="flex-1" />
      <span className={cn('flex items-center gap-1.5', isProcessing && 'text-primary')}>
        {isProcessing ? (
          <>
            <Loader2 className="size-3 animate-spin" /> {labels.processing}
          </>
        ) : (
          <>
            <span className="size-1.5 rounded-full bg-emerald-500" /> {labels.ready}
          </>
        )}
      </span>
    </footer>
  )
}
