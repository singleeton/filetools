'use client'

import { useState, useCallback, useRef } from 'react'
import {
  executeToolClient,
  createDownloadUrl,
  revokeDownloadUrl,
} from '@/services/tool-executor'
import { trackEvent } from '@/lib/analytics'

type ExecutionState = 'idle' | 'processing' | 'done' | 'error'

interface UseToolExecutionReturn {
  state: ExecutionState
  progress: number
  error: string | null
  resultUrl: string | null
  resultFileName: string | null
  execute: (slug: string, files: File[], options?: Record<string, unknown>) => Promise<void>
  reset: () => void
}

export function useToolExecution(): UseToolExecutionReturn {
  const [state, setState] = useState<ExecutionState>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultFileName, setResultFileName] = useState<string | null>(null)
  const urlRef = useRef<string | null>(null)

  const reset = useCallback(() => {
    if (urlRef.current) {
      revokeDownloadUrl(urlRef.current)
      urlRef.current = null
    }
    setState('idle')
    setProgress(0)
    setError(null)
    setResultUrl(null)
    setResultFileName(null)
  }, [])

  const execute = useCallback(
    async (slug: string, files: File[], options?: Record<string, unknown>) => {
      reset()
      setState('processing')

      trackEvent('conversion_start', {
        tool: slug,
        fileCount: files.length,
        totalSize: files.reduce((sum, f) => sum + f.size, 0),
      })

      const result = await executeToolClient(slug, files, options, setProgress)

      if (!result.success) {
        setState('error')
        setError(result.error)
        trackEvent('conversion_error', { tool: slug, error: result.error })
        return
      }

      const url = createDownloadUrl(result.blob)
      urlRef.current = url
      setResultUrl(url)
      setResultFileName(result.fileName)
      setState('done')

      trackEvent('conversion_complete', {
        tool: slug,
        outputSize: result.blob.size,
      })
    },
    [reset],
  )

  return {
    state,
    progress,
    error,
    resultUrl,
    resultFileName,
    execute,
    reset,
  }
}
