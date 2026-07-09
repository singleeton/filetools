'use client'

import { useCallback } from 'react'
import { useMultiFileToolExecution } from '@/hooks/use-multi-file-tool-execution'
import type { WorkingPage } from '../types'

export function useSplitExecution() {
  const execution = useMultiFileToolExecution()

  const executeSplit = useCallback(
    async (file: File, workingPages: WorkingPage[], groups: number[][]) => {
      const pages = workingPages.map((p) => ({ sourceIndex: p.sourceIndex, rotation: p.rotation }))
      await execution.execute('pdf-split', [file], { pages, groups })
    },
    [execution],
  )

  return { ...execution, executeSplit }
}
