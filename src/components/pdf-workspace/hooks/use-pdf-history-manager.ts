'use client'

import { useState, useCallback } from 'react'
import type { Rotation, WorkingPage } from '../types'

const MAX_HISTORY = 30

let uidCounter = 0
function nextId(): string {
  uidCounter += 1
  return `wp-copy-${uidCounter}`
}

export function initWorkingPages(pageCount: number): WorkingPage[] {
  return Array.from({ length: pageCount }, (_, i) => ({
    id: `wp-src-${i}`,
    sourceIndex: i,
    rotation: 0 as Rotation,
  }))
}

export interface UsePdfHistoryManagerReturn {
  pages: WorkingPage[]
  reorder: (fromIndex: number, toIndex: number) => void
  moveSelection: (ids: string[], toIndex: number) => void
  rotate: (ids: string[], delta: 90 | 180 | 270) => void
  remove: (ids: string[]) => void
  duplicate: (ids: string[]) => void
  reverseOrder: () => void
  sortByOriginal: () => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}

/**
 * Owns the working-page list (order, rotation, duplication, deletion) plus a
 * bidirectional undo/redo history. Pure page-list state — selection lives in
 * `usePdfSelection`, keyboard wiring lives in `usePdfShortcuts`.
 */
export function usePdfHistoryManager(initial: WorkingPage[]): UsePdfHistoryManagerReturn {
  const [pages, setPages] = useState<WorkingPage[]>(initial)
  const [past, setPast] = useState<WorkingPage[][]>([])
  const [future, setFuture] = useState<WorkingPage[][]>([])
  // Reset all state during render (not in an Effect) whenever a genuinely new
  // document is loaded (identity change) — the React-recommended pattern for
  // "reset state when a prop changes" without an extra render pass.
  const [prevInitial, setPrevInitial] = useState(initial)
  if (initial !== prevInitial) {
    setPrevInitial(initial)
    setPages(initial)
    setPast([])
    setFuture([])
  }

  const commit = useCallback((updater: (prev: WorkingPage[]) => WorkingPage[]) => {
    setFuture([])
    setPages((prev) => {
      setPast((h) => [...h.slice(-(MAX_HISTORY - 1)), prev])
      return updater(prev)
    })
  }, [])

  const reorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      commit((prev) => {
        if (fromIndex === toIndex) return prev
        const next = [...prev]
        const [moved] = next.splice(fromIndex, 1)
        next.splice(toIndex, 0, moved)
        return next
      })
    },
    [commit],
  )

  const moveSelection = useCallback(
    (ids: string[], toIndex: number) => {
      if (ids.length === 0) return
      const idSet = new Set(ids)
      commit((prev) => {
        const moving = prev.filter((p) => idSet.has(p.id))
        const rest = prev.filter((p) => !idSet.has(p.id))
        const clampedIndex = Math.max(0, Math.min(toIndex, rest.length))
        return [...rest.slice(0, clampedIndex), ...moving, ...rest.slice(clampedIndex)]
      })
    },
    [commit],
  )

  const rotate = useCallback(
    (ids: string[], delta: 90 | 180 | 270) => {
      const idSet = new Set(ids)
      commit((prev) =>
        prev.map((p) =>
          idSet.has(p.id) ? { ...p, rotation: (((p.rotation + delta) % 360) as Rotation) } : p,
        ),
      )
    },
    [commit],
  )

  const remove = useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids)
      commit((prev) => prev.filter((p) => !idSet.has(p.id)))
    },
    [commit],
  )

  const duplicate = useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids)
      commit((prev) => {
        const next: WorkingPage[] = []
        for (const page of prev) {
          next.push(page)
          if (idSet.has(page.id)) {
            next.push({ ...page, id: nextId(), isDuplicate: true })
          }
        }
        return next
      })
    },
    [commit],
  )

  const reverseOrder = useCallback(() => {
    commit((prev) => [...prev].reverse())
  }, [commit])

  const sortByOriginal = useCallback(() => {
    commit((prev) => [...prev].sort((a, b) => a.sourceIndex - b.sourceIndex))
  }, [commit])

  const undo = useCallback(() => {
    setPast((h) => {
      if (h.length === 0) return h
      const previous = h[h.length - 1]
      setPages((current) => {
        setFuture((f) => [...f, current])
        return previous
      })
      return h.slice(0, -1)
    })
  }, [])

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f
      const next = f[f.length - 1]
      setPages((current) => {
        setPast((h) => [...h, current])
        return next
      })
      return f.slice(0, -1)
    })
  }, [])

  return {
    pages,
    reorder,
    moveSelection,
    rotate,
    remove,
    duplicate,
    reverseOrder,
    sortByOriginal,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  }
}
