'use client'

import { useEffect, useState, type MouseEvent, type ReactNode } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Loader2, RotateCcw, RotateCw, Trash2, Copy, Eye, FileOutput } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from '@/components/ui/context-menu'
import type { ClickModifiers } from '../hooks/use-pdf-selection'
import type { PdfThumbnailInfo, WorkingPage } from '../types'

export interface PdfThumbnailLabels {
  page: string
  copySuffix: string
  rotateLeft: string
  rotateRight: string
  duplicate: string
  delete: string
  preview: string
  extract: string
  move: string
  splitAfter: string
  splitBefore: string
}

interface PdfThumbnailProps {
  page: WorkingPage
  position: number
  selected: boolean
  cardWidthPx: number
  getThumbnail: (sourceIndex: number) => Promise<PdfThumbnailInfo>
  onSelect: (id: string, modifiers?: ClickModifiers) => void
  onRotateLeft: (id: string) => void
  onRotateRight: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onPreview: (id: string) => void
  onExtract: (id: string) => void
  onSplitAfter?: (position: number) => void
  onSplitBefore?: (position: number) => void
  labels: PdfThumbnailLabels
  disableLayoutAnimation?: boolean
  isDragOverlay?: boolean
}

export function PdfThumbnail({
  page,
  position,
  selected,
  cardWidthPx,
  getThumbnail,
  onSelect,
  onRotateLeft,
  onRotateRight,
  onDelete,
  onDuplicate,
  onPreview,
  onExtract,
  onSplitAfter,
  onSplitBefore,
  labels,
  disableLayoutAnimation,
  isDragOverlay,
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

  function handleCardClick(e: MouseEvent) {
    onSelect(page.id, { shiftKey: e.shiftKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey })
  }

  const card = (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      style={
        isDragOverlay
          ? { width: cardWidthPx }
          : { transform: CSS.Transform.toString(transform), transition, width: cardWidthPx }
      }
      className={cn(
        'group relative flex shrink-0 flex-col gap-2 rounded-xl border bg-card p-2 shadow-sm transition-shadow duration-200',
        selected && 'border-primary ring-2 ring-primary/30',
        isDragging && 'opacity-30',
        isDragOverlay && 'scale-[1.04] rotate-1 shadow-2xl ring-2 ring-primary/40',
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(page.id, { ctrlKey: true })}
          onClick={(e) => e.stopPropagation()}
          aria-label={`${labels.page} ${position + 1}`}
          className="size-4 accent-primary"
        />
        {!isDragOverlay && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab touch-none rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted active:cursor-grabbing group-hover:opacity-100"
            aria-label={labels.move}
          >
            <GripVertical className="size-4" />
          </button>
        )}
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect(page.id, { shiftKey: e.shiftKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey })
          }
        }}
        className="relative mx-auto flex aspect-[3/4] cursor-pointer items-center justify-center overflow-hidden rounded-lg border bg-muted"
        style={{ width: '100%' }}
      >
        {thumb ? (
          <img
            src={thumb.dataUrl}
            alt={`${labels.page} ${position + 1}`}
            style={{ transform: `rotate(${page.rotation}deg)`, transformOrigin: 'center' }}
            className="max-h-full max-w-full object-contain transition-transform duration-200"
          />
        ) : (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        )}

        {!isDragOverlay && cardWidthPx > 90 && (
          <div className="absolute inset-x-0 top-0 flex items-center justify-center gap-0.5 bg-gradient-to-b from-black/60 to-transparent p-1 opacity-0 transition-opacity group-hover:opacity-100">
            <HoverIcon label={labels.rotateLeft} onClick={() => onRotateLeft(page.id)}>
              <RotateCcw className="size-3.5" />
            </HoverIcon>
            <HoverIcon label={labels.rotateRight} onClick={() => onRotateRight(page.id)}>
              <RotateCw className="size-3.5" />
            </HoverIcon>
            <HoverIcon label={labels.duplicate} onClick={() => onDuplicate(page.id)}>
              <Copy className="size-3.5" />
            </HoverIcon>
            <HoverIcon label={labels.preview} onClick={() => onPreview(page.id)}>
              <Eye className="size-3.5" />
            </HoverIcon>
            <HoverIcon label={labels.delete} onClick={() => onDelete(page.id)} destructive>
              <Trash2 className="size-3.5" />
            </HoverIcon>
          </div>
        )}
      </div>

      <div className="truncate text-center text-xs text-muted-foreground">
        {labels.page} {position + 1}
        {page.isDuplicate ? ` ${labels.copySuffix}` : ''}
      </div>
    </div>
  )

  if (isDragOverlay) return card

  return (
    <ContextMenu>
      <ContextMenuTrigger>{card}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onRotateLeft(page.id)}>
          <RotateCcw /> {labels.rotateLeft}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onRotateRight(page.id)}>
          <RotateCw /> {labels.rotateRight}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onDuplicate(page.id)}>
          <Copy /> {labels.duplicate}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onPreview(page.id)}>
          <Eye /> {labels.preview}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onExtract(page.id)}>
          <FileOutput /> {labels.extract}
        </ContextMenuItem>
        <ContextMenuSeparator />
        {onSplitBefore && (
          <ContextMenuItem onClick={() => onSplitBefore(position)}>{labels.splitBefore}</ContextMenuItem>
        )}
        {onSplitAfter && <ContextMenuItem onClick={() => onSplitAfter(position)}>{labels.splitAfter}</ContextMenuItem>}
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => onDelete(page.id)} className="text-destructive [&_svg]:text-destructive">
          <Trash2 /> {labels.delete}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

function HoverIcon({
  label,
  onClick,
  destructive,
  children,
}: {
  label: string
  onClick: () => void
  destructive?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      aria-label={label}
      title={label}
      className={cn(
        'rounded p-1 text-white/90 hover:bg-white/20 hover:text-white',
        destructive && 'hover:bg-destructive/80',
      )}
    >
      {children}
    </button>
  )
}
