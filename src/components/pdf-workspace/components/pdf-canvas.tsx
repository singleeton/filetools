'use client'

import { useEffect, type ReactNode, type RefObject } from 'react'

interface PdfCanvasProps {
  // Owned by the parent (PdfWorkspace) and shared with PdfGrid, so the
  // virtualizer scrolls the *same* element this component measures and
  // scrolls — a nested `overflow-auto` inside an already-scrolling canvas
  // would fight the outer scroll and break "jump to page".
  scrollRef: RefObject<HTMLDivElement | null>
  onContainerResize: (width: number, height: number) => void
  // Rendered above the scroll area, in normal document flow — pushes the
  // grid down rather than overlapping it (unlike a plain absolute overlay,
  // which would sit on top of the first row and eat its clicks).
  topBar?: ReactNode
  children: ReactNode
}

/**
 * The center work area — ~75% of the layout width per the spec. Owns the
 * single scroll container (via `scrollRef`) and feeds live size measurements
 * to `usePdfZoom` so "fit width / height / screen" can compute a card size.
 */
export function PdfCanvas({ scrollRef, onContainerResize, topBar, children }: PdfCanvasProps) {
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      onContainerResize(entry.contentRect.width, entry.contentRect.height)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [scrollRef, onContainerResize])

  return (
    <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-muted/20">
      {topBar && <div className="flex justify-center px-4 pt-3">{topBar}</div>}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-6 pb-5 pt-2">
        {children}
      </div>
    </div>
  )
}
