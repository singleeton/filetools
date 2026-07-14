'use client'

import { useState, useMemo, useCallback } from 'react'
import { deriveGroups } from '../lib/split-plan'
import type { SplitConfig, SplitMode, SplitRange, WorkingPage } from '../types'

export interface UseSplitEngineReturn {
  mode: SplitMode
  setMode: (mode: SplitMode) => void
  ranges: SplitRange[]
  setRanges: (ranges: SplitRange[]) => void
  everyN: number
  setEveryN: (n: number) => void
  splitAfterPositions: number[]
  toggleSplitAfter: (position: number) => void
  splitAfterSelectedPage: (position: number) => void
  splitBeforeSelectedPage: (position: number) => void
  groups: number[][]
}

/**
 * The split "engine": pure derivation of output-file groups from the
 * current working page list + a mode-specific config. Reused by every
 * workspace tool that produces multiple output files (Split, Extract via
 * `extract` mode) — whole-document tools (Rotate, Delete, ...) bypass this
 * and export a single `wholeDocumentGroup` instead.
 */
export function useSplitEngine(workingPages: WorkingPage[], selectedIds: Set<string>): UseSplitEngineReturn {
  const [mode, setMode] = useState<SplitMode>('extract')
  const [ranges, setRanges] = useState<SplitRange[]>([{ start: 1, end: workingPages.length || 1 }])
  const [everyN, setEveryN] = useState(1)
  const [splitAfterPositions, setSplitAfterPositions] = useState<number[]>([])

  const toggleSplitAfter = useCallback((position: number) => {
    setSplitAfterPositions((prev) =>
      prev.includes(position) ? prev.filter((p) => p !== position) : [...prev, position].sort((a, b) => a - b),
    )
  }, [])

  // "Split after selected page": add a boundary right after `position`,
  // switching into custom mode so the divider becomes visible immediately.
  const splitAfterSelectedPage = useCallback((position: number) => {
    setMode('custom')
    setSplitAfterPositions((prev) => (prev.includes(position) ? prev : [...prev, position].sort((a, b) => a - b)))
  }, [])

  // "Split before selected page": equivalent to a boundary after `position - 1`.
  const splitBeforeSelectedPage = useCallback((position: number) => {
    if (position <= 0) return
    setMode('custom')
    const boundary = position - 1
    setSplitAfterPositions((prev) => (prev.includes(boundary) ? prev : [...prev, boundary].sort((a, b) => a - b)))
  }, [])

  const config: SplitConfig = useMemo(() => {
    switch (mode) {
      case 'extract':
        return { mode: 'extract', selectedIds: Array.from(selectedIds) }
      case 'everyPage':
        return { mode: 'everyPage' }
      case 'byRange':
        return { mode: 'byRange', ranges }
      case 'everyNPages':
        return { mode: 'everyNPages', n: everyN }
      case 'custom':
        return { mode: 'custom', splitAfterPositions }
    }
  }, [mode, selectedIds, ranges, everyN, splitAfterPositions])

  const groups = useMemo(() => deriveGroups(workingPages, config), [workingPages, config])

  return {
    mode,
    setMode,
    ranges,
    setRanges,
    everyN,
    setEveryN,
    splitAfterPositions,
    toggleSplitAfter,
    splitAfterSelectedPage,
    splitBeforeSelectedPage,
    groups,
  }
}
