'use client'

import { useState, useMemo, useCallback } from 'react'
import { deriveGroups } from '../lib/split-plan'
import type { SplitConfig, SplitMode, SplitRange, WorkingPage } from '../types'

interface UseSplitPlanReturn {
  mode: SplitMode
  setMode: (mode: SplitMode) => void
  ranges: SplitRange[]
  setRanges: (ranges: SplitRange[]) => void
  everyN: number
  setEveryN: (n: number) => void
  splitAfterPositions: number[]
  toggleSplitAfter: (position: number) => void
  groups: number[][]
}

export function useSplitPlan(
  workingPages: WorkingPage[],
  selectedIds: Set<string>,
): UseSplitPlanReturn {
  const [mode, setMode] = useState<SplitMode>('extract')
  const [ranges, setRanges] = useState<SplitRange[]>([{ start: 1, end: workingPages.length || 1 }])
  const [everyN, setEveryN] = useState(1)
  const [splitAfterPositions, setSplitAfterPositions] = useState<number[]>([])

  const toggleSplitAfter = useCallback((position: number) => {
    setSplitAfterPositions((prev) =>
      prev.includes(position)
        ? prev.filter((p) => p !== position)
        : [...prev, position].sort((a, b) => a - b),
    )
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
    groups,
  }
}
