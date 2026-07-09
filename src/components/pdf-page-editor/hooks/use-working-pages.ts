'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Rotation, WorkingPage } from '../types'

const MAX_HISTORY = 20

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

interface UseWorkingPagesReturn {
  pages: WorkingPage[]
  selectedIds: Set<string>
  reorder: (fromIndex: number, toIndex: number) => void
  rotate: (ids: string[], delta: 90 | 180 | 270) => void
  remove: (ids: string[]) => void
  duplicate: (id: string) => void
  toggleSelect: (id: string) => void
  selectAll: () => void
  deselectAll: () => void
  invertSelection: () => void
  undo: () => void
  canUndo: boolean
}

export function useWorkingPages(initial: WorkingPage[]): UseWorkingPagesReturn {
  const [pages, setPages] = useState<WorkingPage[]>(initial)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [history, setHistory] = useState<WorkingPage[][]>([])

  useEffect(() => {
    setPages(initial)
    setSelectedIds(new Set())
    setHistory([])
    // Only re-init when a genuinely new document is loaded (identity change).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial])

  const commit = useCallback((updater: (prev: WorkingPage[]) => WorkingPage[]) => {
    setPages((prev) => {
      setHistory((h) => [...h.slice(-(MAX_HISTORY - 1)), prev])
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
      setSelectedIds((prev) => {
        const next = new Set(prev)
        ids.forEach((id) => next.delete(id))
        return next
      })
    },
    [commit],
  )

  const duplicate = useCallback(
    (id: string) => {
      commit((prev) => {
        const index = prev.findIndex((p) => p.id === id)
        if (index === -1) return prev
        const copy: WorkingPage = { ...prev[index], id: nextId(), isDuplicate: true }
        const next = [...prev]
        next.splice(index + 1, 0, copy)
        return next
      })
    },
    [commit],
  )

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(pages.map((p) => p.id)))
  }, [pages])

  const deselectAll = useCallback(() => setSelectedIds(new Set()), [])

  const invertSelection = useCallback(() => {
    setSelectedIds((prev) => new Set(pages.filter((p) => !prev.has(p.id)).map((p) => p.id)))
  }, [pages])

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h
      const previous = h[h.length - 1]
      setPages(previous)
      return h.slice(0, -1)
    })
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.size > 0) {
          e.preventDefault()
          remove(Array.from(selectedIds))
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        selectAll()
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        undo()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedIds, remove, selectAll, undo])

  return {
    pages,
    selectedIds,
    reorder,
    rotate,
    remove,
    duplicate,
    toggleSelect,
    selectAll,
    deselectAll,
    invertSelection,
    undo,
    canUndo: history.length > 0,
  }
}
