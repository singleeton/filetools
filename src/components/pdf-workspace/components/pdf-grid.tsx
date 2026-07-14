'use client'

import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Scissors } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PdfThumbnail, type PdfThumbnailLabels } from './pdf-thumbnail'
import type { ClickModifiers } from '../hooks/use-pdf-selection'
import type { PdfThumbnailInfo, WorkingPage } from '../types'

// Below this page count, dnd-kit's sibling shift-animation and full DOM
// rendering perform fine on their own. Above it, we switch to a virtualized
// grid instead — running dnd-kit's transform-based shift animation and the
// virtualizer's transform-based positioning at once causes visible jank, so
// virtualized rows intentionally disable the shift animation (see
// `disableLayoutAnimation` below) rather than fight over it.
const VIRTUALIZE_THRESHOLD = 60
const GAP = 14

interface PageGridHandlers {
  onSelect: (id: string, modifiers?: ClickModifiers) => void
  onRotateLeft: (id: string) => void
  onRotateRight: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onPreview: (id: string) => void
  onExtract: (id: string) => void
  onSplitAfter?: (position: number) => void
  onSplitBefore?: (position: number) => void
}

interface PdfGridProps extends PageGridHandlers {
  pages: WorkingPage[]
  selectedIds: Set<string>
  cardWidthPx: number
  getThumbnail: (sourceIndex: number) => Promise<PdfThumbnailInfo>
  onReorder: (fromIndex: number, toIndex: number) => void
  labels: PdfThumbnailLabels
  // Only offered in the non-virtualized layout — inserting split points is a
  // precision operation typically done on smaller documents, matching the
  // same virtualization trade-off already made for drag animation.
  customSplitMode?: boolean
  splitAfterPositions?: number[]
  onToggleSplitAfter?: (position: number) => void
  scrollToPosition?: number | null
  onScrolledToPosition?: () => void
  // The single scroll container PdfCanvas owns — the virtualized grid must
  // scroll this element rather than a nested one of its own (see PdfCanvas).
  scrollContainerRef: RefObject<HTMLDivElement | null>
}

export function PdfGrid({
  pages,
  selectedIds,
  cardWidthPx,
  getThumbnail,
  onReorder,
  labels,
  customSplitMode,
  splitAfterPositions,
  onToggleSplitAfter,
  scrollToPosition,
  onScrolledToPosition,
  scrollContainerRef,
  ...handlers
}: PdfGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const ids = useMemo(() => pages.map((p) => p.id), [pages])
  const [activeId, setActiveId] = useState<string | null>(null)
  const activePage = activeId ? pages.find((p) => p.id === activeId) ?? null : null
  const activePosition = activeId ? pages.findIndex((p) => p.id === activeId) : -1

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return
    const fromIndex = pages.findIndex((p) => p.id === active.id)
    const toIndex = pages.findIndex((p) => p.id === over.id)
    if (fromIndex === -1 || toIndex === -1) return
    onReorder(fromIndex, toIndex)
  }

  const virtualize = pages.length > VIRTUALIZE_THRESHOLD

  const itemProps = { selectedIds, cardWidthPx, getThumbnail, labels, ...handlers }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        {virtualize ? (
          <VirtualizedPageGrid
            pages={pages}
            scrollToPosition={scrollToPosition}
            onScrolledToPosition={onScrolledToPosition}
            scrollContainerRef={scrollContainerRef}
            {...itemProps}
          />
        ) : (
          <FlowPageGrid
            pages={pages}
            customSplitMode={customSplitMode}
            splitAfterPositions={splitAfterPositions}
            onToggleSplitAfter={onToggleSplitAfter}
            scrollToPosition={scrollToPosition}
            onScrolledToPosition={onScrolledToPosition}
            {...itemProps}
          />
        )}
      </SortableContext>

      <DragOverlay>
        {activePage && (
          <PdfThumbnail
            page={activePage}
            position={activePosition}
            selected={selectedIds.has(activePage.id)}
            cardWidthPx={cardWidthPx}
            getThumbnail={getThumbnail}
            onSelect={() => {}}
            onRotateLeft={() => {}}
            onRotateRight={() => {}}
            onDelete={() => {}}
            onDuplicate={() => {}}
            onPreview={() => {}}
            onExtract={() => {}}
            labels={labels}
            isDragOverlay
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}

interface FlowPageGridProps extends PageGridHandlers {
  pages: WorkingPage[]
  selectedIds: Set<string>
  cardWidthPx: number
  getThumbnail: (sourceIndex: number) => Promise<PdfThumbnailInfo>
  labels: PdfThumbnailLabels
  customSplitMode?: boolean
  splitAfterPositions?: number[]
  onToggleSplitAfter?: (position: number) => void
  scrollToPosition?: number | null
  onScrolledToPosition?: () => void
}

function FlowPageGrid({
  pages,
  selectedIds,
  customSplitMode,
  splitAfterPositions,
  onToggleSplitAfter,
  scrollToPosition,
  onScrolledToPosition,
  ...itemProps
}: FlowPageGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollToPosition == null || !containerRef.current) return
    const el = containerRef.current.querySelector<HTMLElement>(`[data-page-position="${scrollToPosition}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    onScrolledToPosition?.()
  }, [scrollToPosition, onScrolledToPosition])

  return (
    <div ref={containerRef} className="flex flex-wrap items-start gap-4 py-2">
      {pages.map((page, i) => (
        <div key={page.id} data-page-position={i} className="flex items-center gap-3">
          <PdfThumbnail page={page} position={i} selected={selectedIds.has(page.id)} {...itemProps} />
          {customSplitMode && i < pages.length - 1 && (
            <SplitDivider
              active={Boolean(splitAfterPositions?.includes(i))}
              onClick={() => onToggleSplitAfter?.(i)}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function SplitDivider({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title="Toggle split point"
      className={cn(
        'flex h-24 w-4 shrink-0 items-center justify-center rounded-full border-2 border-dashed transition-colors',
        active ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50',
      )}
    >
      <Scissors className="size-3.5 rotate-90" />
    </button>
  )
}

interface VirtualizedPageGridProps extends PageGridHandlers {
  pages: WorkingPage[]
  selectedIds: Set<string>
  cardWidthPx: number
  getThumbnail: (sourceIndex: number) => Promise<PdfThumbnailInfo>
  labels: PdfThumbnailLabels
  scrollToPosition?: number | null
  onScrolledToPosition?: () => void
  scrollContainerRef: RefObject<HTMLDivElement | null>
}

function VirtualizedPageGrid({
  pages,
  cardWidthPx,
  selectedIds,
  scrollToPosition,
  onScrolledToPosition,
  scrollContainerRef,
  ...handlers
}: VirtualizedPageGridProps) {
  const [columns, setColumns] = useState(4)

  const itemWidth = cardWidthPx + GAP
  const rowHeight = cardWidthPx * 1.65 + GAP

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      setColumns(Math.max(1, Math.floor(el.clientWidth / itemWidth)))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [itemWidth, scrollContainerRef])

  const rowCount = Math.ceil(pages.length / columns)

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => rowHeight,
    overscan: 3,
  })

  useEffect(() => {
    if (scrollToPosition == null) return
    const rowIndex = Math.floor(scrollToPosition / columns)
    virtualizer.scrollToIndex(rowIndex, { align: 'center' })
    onScrolledToPosition?.()
  }, [scrollToPosition, columns, virtualizer, onScrolledToPosition])

  return (
    <div style={{ height: virtualizer.getTotalSize(), position: 'relative', width: '100%' }}>
      {virtualizer.getVirtualItems().map((virtualRow) => {
        const startIndex = virtualRow.index * columns
        const rowPages = pages.slice(startIndex, startIndex + columns)
        return (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
              display: 'flex',
              gap: GAP,
            }}
          >
            {rowPages.map((page, i) => (
              <PdfThumbnail
                key={page.id}
                page={page}
                position={startIndex + i}
                selected={selectedIds.has(page.id)}
                cardWidthPx={cardWidthPx}
                disableLayoutAnimation
                {...handlers}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}
