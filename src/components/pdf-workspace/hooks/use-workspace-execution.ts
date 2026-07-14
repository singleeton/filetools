'use client'

import { useCallback } from 'react'
import { useMultiFileToolExecution } from '@/hooks/use-multi-file-tool-execution'
import type { OutlineNode, PageLabelRange, WorkingPage } from '../types'

export interface WorkspaceExportExtras {
  outputBaseName?: string
  outline?: OutlineNode[]
  pageLabels?: PageLabelRange[]
}

/**
 * Thin wrapper around the generic multi-file execution hook: serializes the
 * working page list + output groups into the shape every workspace-export
 * server handler expects (`{ pages, groups }`). The `slug` is passed in per
 * call so the same hook backs every tool mounted on `PdfWorkspace` (split,
 * rotate, ...) while each keeps its own usage-limit/analytics bucket.
 */
export function useWorkspaceExecution() {
  const execution = useMultiFileToolExecution()

  const executeExport = useCallback(
    async (slug: string, file: File, workingPages: WorkingPage[], groups: number[][], extras: WorkspaceExportExtras = {}) => {
      const pages = workingPages.map((p) => ({ sourceIndex: p.sourceIndex, rotation: p.rotation }))
      await execution.execute(slug, [file], {
        pages,
        groups,
        outputBaseName: extras.outputBaseName,
        outline: extras.outline,
        pageLabels: extras.pageLabels,
      })
    },
    [execution],
  )

  return { ...execution, executeExport }
}
