'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { WorkingPage } from '../types'

export interface ClickModifiers {
  shiftKey?: boolean
  ctrlKey?: boolean
  metaKey?: boolean
}

export interface UsePdfSelectionReturn {
  selectedIds: Set<string>
  setSelectedIds: (ids: Set<string>) => void
  select: (id: string, modifiers?: ClickModifiers) => void
  toggleSelect: (id: string) => void
  selectAll: () => void
  deselectAll: () => void
  invertSelection: () => void
}

/**
 * Selection state for the page grid. Supports plain click (select one),
 * ctrl/cmd+click (toggle one), and shift+click (select the contiguous range
 * from the last anchor to the clicked card) — mirroring Explorer/Finder
 * multi-select conventions.
 */
export function usePdfSelection(pages: WorkingPage[]): UsePdfSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const anchorRef = useRef<string | null>(null)

  // Drop ids that no longer exist (page deleted/undo/redo swapped the list).
  // Done during render (not in an Effect) so it settles in the same pass
  // instead of committing a stale selection first and correcting it a tick
  // later. Only state is touched here — refs must not be read/written during
  // render, so the anchor ref is pruned separately below.
  const [prevPages, setPrevPages] = useState(pages)
  if (pages !== prevPages) {
    setPrevPages(pages)
    const validIds = new Set(pages.map((p) => p.id))
    let changed = false
    const next = new Set<string>()
    selectedIds.forEach((id) => {
      if (validIds.has(id)) next.add(id)
      else changed = true
    })
    if (changed) setSelectedIds(next)
  }

  useEffect(() => {
    if (anchorRef.current && !pages.some((p) => p.id === anchorRef.current)) {
      anchorRef.current = null
    }
  }, [pages])

  const select = useCallback(
    (id: string, modifiers: ClickModifiers = {}) => {
      const { shiftKey, ctrlKey, metaKey } = modifiers

      if (shiftKey && anchorRef.current) {
        const ids = pages.map((p) => p.id)
        const anchorIndex = ids.indexOf(anchorRef.current)
        const clickedIndex = ids.indexOf(id)
        if (anchorIndex === -1 || clickedIndex === -1) {
          setSelectedIds(new Set([id]))
          anchorRef.current = id
          return
        }
        const [from, to] = anchorIndex < clickedIndex ? [anchorIndex, clickedIndex] : [clickedIndex, anchorIndex]
        setSelectedIds(new Set(ids.slice(from, to + 1)))
        return
      }

      if (ctrlKey || metaKey) {
        setSelectedIds((prev) => {
          const next = new Set(prev)
          if (next.has(id)) next.delete(id)
          else next.add(id)
          return next
        })
        anchorRef.current = id
        return
      }

      setSelectedIds(new Set([id]))
      anchorRef.current = id
    },
    [pages],
  )

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    anchorRef.current = id
  }, [])

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(pages.map((p) => p.id)))
  }, [pages])

  const deselectAll = useCallback(() => setSelectedIds(new Set()), [])

  const invertSelection = useCallback(() => {
    setSelectedIds((prev) => new Set(pages.filter((p) => !prev.has(p.id)).map((p) => p.id)))
  }, [pages])

  return { selectedIds, setSelectedIds, select, toggleSelect, selectAll, deselectAll, invertSelection }
}
