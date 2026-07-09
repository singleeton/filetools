'use client'

import { useEffect, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageActions, type PageActionLabels } from './page-actions'
import type { PdfThumbnailInfo, WorkingPage } from '../types'

export type ZoomLevel = 'small' | 'medium' | 'large'

export const ZOOM_WIDTH: Record<ZoomLevel, number> = {
  small: 96,
  medium: 140,
  large: 200,
}

export interface PdfThumbnailLabels extends PageActionLabels {
  copySuffix: string
  page: string
}

interface PdfThumbnailProps {
  page: WorkingPage
  position: number
  selected: boolean
  zoom: ZoomLevel
  getThumbnail: (sourceIndex: number) => Promise<PdfThumbnailInfo>
  onToggleSelect: (id: string) => void
  onRotate: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  labels: PdfThumbnailLabels
  disableLayoutAnimation?: boolean
}

export function PdfThumbnail({
  page,
  position,
  selected,
  zoom,
  getThumbnail,
  onToggleSelect,
  onRotate,
  onDelete,
  onDuplicate,
  labels,
  disableLayoutAnimation,
}: PdfThumbnailProps) {
  const [thumb, setThumb] = useState<PdfThumbnailInfo | null>(null)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: page.id,
    animateLayoutChanges: disableLayoutAnimation ? () => false : undefined,
  })

  useEffect(() => {
    let cancelled = false
    getThumbnail(page.sourceIndex).then((info) => {
      if (!cancelled) setThumb(info)
    })
    return () => {
      cancelled = true
    }
  }, [page.sourceIndex, getThumbnail])

  const width = ZOOM_WIDTH[zoom]

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, width }}
      className={cn(
        'group relative flex shrink-0 flex-col gap-2 rounded-lg border bg-card p-2 shadow-sm',
        selected && 'border-primary ring-2 ring-primary/30',
        isDragging && 'z-10 opacity-70 shadow-lg',
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(page.id)}
          aria-label={`${labels.page} ${position + 1}`}
          className="size-4 accent-primary"
        />
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="size-4" />
        </button>
      </div>

      <div
        className="relative mx-auto flex aspect-[3/4] items-center justify-center overflow-hidden rounded border bg-muted"
        style={{ width }}
      >
        {thumb ? (
          <img
            src={thumb.dataUrl}
            alt={`${labels.page} ${position + 1}`}
            style={{ transform: `rotate(${page.rotation}deg)`, transformOrigin: 'center' }}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        )}
      </div>

      <div className="truncate text-center text-xs text-muted-foreground">
        {labels.page} {position + 1}
        {page.isDuplicate ? ` ${labels.copySuffix}` : ''}
      </div>

      <PageActions
        onRotate={() => onRotate(page.id)}
        onDuplicate={() => onDuplicate(page.id)}
        onDelete={() => onDelete(page.id)}
        labels={labels}
        className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      />
    </div>
  )
}
