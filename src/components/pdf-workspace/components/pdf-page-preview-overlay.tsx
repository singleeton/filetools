'use client'

import { useEffect, useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import type { PdfThumbnailInfo, WorkingPage } from '../types'

interface PdfPagePreviewOverlayProps {
  page: WorkingPage
  position: number
  getThumbnail: (sourceIndex: number, maxWidth?: number) => Promise<PdfThumbnailInfo>
  onClose: () => void
  pageLabel: string
}

export function PdfPagePreviewOverlay({ page, position, getThumbnail, onClose, pageLabel }: PdfPagePreviewOverlayProps) {
  const [thumb, setThumb] = useState<PdfThumbnailInfo | null>(null)

  useEffect(() => {
    let cancelled = false
    getThumbnail(page.sourceIndex, 1800).then((info) => {
      if (!cancelled) setThumb(info)
    })
    return () => {
      cancelled = true
    }
  }, [page.sourceIndex, getThumbnail])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white"
        aria-label="Close"
      >
        <X className="size-5" />
      </button>

      <div className="flex h-[90vh] w-[min(92vw,1400px)] flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-white shadow-2xl">
          {thumb ? (
            <img
              src={thumb.dataUrl}
              alt={`${pageLabel} ${position + 1}`}
              style={{ transform: `rotate(${page.rotation}deg)` }}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-64 w-48 items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        <span className="text-sm font-medium text-white/90">
          {pageLabel} {position + 1}
        </span>
      </div>
    </div>
  )
}
