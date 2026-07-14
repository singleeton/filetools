'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { PdfThumbnailInfo, WorkingPage } from '../types'

export interface FinalPreviewLabels {
  outputFilesLabel: string
  splitPointLabel: string
  deletedPagesLabel: string
  confirmButton: string
  backButton: string
}

interface FinalPreviewStepProps {
  workingPages: WorkingPage[]
  groups: number[][]
  originalPageCount: number
  getThumbnail: (sourceIndex: number) => Promise<PdfThumbnailInfo>
  onConfirm: () => void
  onBack: () => void
  labels: FinalPreviewLabels
}

export function FinalPreviewStep({
  workingPages,
  groups,
  originalPageCount,
  getThumbnail,
  onConfirm,
  onBack,
  labels,
}: FinalPreviewStepProps) {
  const usedSourceIndices = new Set(workingPages.map((p) => p.sourceIndex))
  const deletedPageNumbers = Array.from({ length: originalPageCount }, (_, i) => i + 1).filter(
    (n) => !usedSourceIndices.has(n - 1),
  )

  return (
    <div className="space-y-4 overflow-y-auto p-6">
      <p className="text-sm text-muted-foreground">
        {labels.outputFilesLabel}: {groups.length}
      </p>

      <div className="flex flex-wrap gap-4">
        {groups.map((group, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg border bg-muted/30 p-2">
            <span className="text-xs font-medium text-muted-foreground">
              {labels.splitPointLabel} #{i + 1}
            </span>
            <div className="flex gap-1">
              {group.map((pageIndex) => (
                <MiniThumbnail
                  key={workingPages[pageIndex].id}
                  page={workingPages[pageIndex]}
                  getThumbnail={getThumbnail}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {deletedPageNumbers.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {labels.deletedPagesLabel}: {deletedPageNumbers.join(', ')}
        </p>
      )}

      <div className="flex justify-center gap-3 pt-2">
        <Button variant="outline" onClick={onBack}>
          {labels.backButton}
        </Button>
        <Button onClick={onConfirm}>{labels.confirmButton}</Button>
      </div>
    </div>
  )
}

function MiniThumbnail({
  page,
  getThumbnail,
}: {
  page: WorkingPage
  getThumbnail: (sourceIndex: number) => Promise<PdfThumbnailInfo>
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getThumbnail(page.sourceIndex).then((info) => {
      if (!cancelled) setDataUrl(info.dataUrl)
    })
    return () => {
      cancelled = true
    }
  }, [page.sourceIndex, getThumbnail])

  return (
    <div className="flex h-16 w-12 items-center justify-center overflow-hidden rounded border bg-background">
      {dataUrl && (
        <img
          src={dataUrl}
          alt=""
          style={{ transform: `rotate(${page.rotation}deg)` }}
          className="max-h-full max-w-full object-contain"
        />
      )}
    </div>
  )
}
