'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Scissors } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PdfThumbnail, ZOOM_WIDTH, type PdfThumbnailLabels, type ZoomLevel } from './pdf-thumbnail'
import type { PdfThumbnailInfo, WorkingPage } from '../types'

// Below this page count, dnd-kit's sibling shift-animation and full DOM
// rendering perform fine on their own. Above it, we switch to a virtualized
// grid instead — running dnd-kit's transform-based shift animation and the
// virtualizer's transform-based positioning at once causes visible jank, so
// virtualized rows intentionally disable the shift animation (see
// `disableLayoutAnimation` below) rather than fight over it.
const VIRTUALIZE_THRESHOLD = 60
const GAP = 12

interface PageGridProps {
  pages: WorkingPage[]
  selectedIds: Set<string>
  zoom: ZoomLevel
  getThumbnail: (sourceIndex: number) => Promise<PdfThumbnailInfo>
  onReorder: (fromIndex: number, toIndex: number) => void
  onToggleSelect: (id: string) => void
  onRotate: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  labels: PdfThumbnailLabels
  // Only offered in the non-virtualized layout — inserting split points is a
  // precision operation typically done on smaller documents, matching the
  // same virtualization trade-off already made for drag animation.
  customSplitMode?: boolean
  splitAfterPositions?: number[]
  onToggleSplitAfter?: (position: number) => void
}

export function PageGrid({
  pages,
  selectedIds,
  zoom,
  getThumbnail,
  onReorder,
  onToggleSelect,
  onRotate,
  onDelete,
  onDuplicate,
  labels,
  customSplitMode,
  splitAfterPositions,
  onToggleSplitAfter,
}: PageGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const ids = useMemo(() => pages.map((p) => p.id), [pages])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const fromIndex = pages.findIndex((p) => p.id === active.id)
    const toIndex = pages.findIndex((p) => p.id === over.id)
    if (fromIndex === -1 || toIndex === -1) return
    onReorder(fromIndex, toIndex)
  }

  const virtualize = pages.length > VIRTUALIZE_THRESHOLD

  const itemProps = { selectedIds, zoom, getThumbnail, onToggleSelect, onRotate, onDelete, onDuplicate, labels }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        {virtualize ? (
          <VirtualizedPageGrid pages={pages} {...itemProps} />
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            {pages.map((page, i) => (
              <div key={page.id} className="flex items-center gap-3">
                <PdfThumbnail
                  page={page}
                  position={i}
                  selected={selectedIds.has(page.id)}
                  zoom={zoom}
                  getThumbnail={getThumbnail}
                  onToggleSelect={onToggleSelect}
                  onRotate={onRotate}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  labels={labels}
                />
                {customSplitMode && i < pages.length - 1 && (
                  <SplitDivider
                    active={Boolean(splitAfterPositions?.includes(i))}
                    onClick={() => onToggleSplitAfter?.(i)}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </SortableContext>
    </DndContext>
  )
}

interface VirtualizedPageGridProps {
  pages: WorkingPage[]
  selectedIds: Set<string>
  zoom: ZoomLevel
  getThumbnail: (sourceIndex: number) => Promise<PdfThumbnailInfo>
  onToggleSelect: (id: string) => void
  onRotate: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  labels: PdfThumbnailLabels
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

function VirtualizedPageGrid({ pages, zoom, selectedIds, ...handlers }: VirtualizedPageGridProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [columns, setColumns] = useState(4)

  const itemWidth = ZOOM_WIDTH[zoom] + GAP
  const rowHeight = ZOOM_WIDTH[zoom] * 1.6 + GAP

  useEffect(() => {
    const el = parentRef.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      setColumns(Math.max(1, Math.floor(el.clientWidth / itemWidth)))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [itemWidth])

  const rowCount = Math.ceil(pages.length / columns)

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 3,
  })

  return (
    <div ref={parentRef} className="max-h-[70vh] overflow-auto">
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
                  zoom={zoom}
                  disableLayoutAnimation
                  {...handlers}
                />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
