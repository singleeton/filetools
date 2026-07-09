'use client'

import { useState, useCallback, useRef } from 'react'
import { executeMultiFileToolClient, type MultiFileResult } from '@/services/tool-executor'
import { trackEvent } from '@/lib/analytics'

type ExecutionState = 'idle' | 'processing' | 'done' | 'error'
export type ProcessingPhase = 'reading' | 'preparing' | 'creating' | 'done'

interface UseMultiFileToolExecutionReturn {
  state: ExecutionState
  phase: ProcessingPhase
  error: string | null
  results: MultiFileResult[] | null
  execute: (slug: string, files: File[], options?: Record<string, unknown>) => Promise<void>
  reset: () => void
}

// There is no real server-side progress channel (would require SSE, out of
// scope), so the 4-step processing screen advances on a time-based heuristic
// rather than tracking actual server progress.
const PHASE_SCHEDULE: { phase: ProcessingPhase; delayMs: number }[] = [
  { phase: 'preparing', delayMs: 400 },
  { phase: 'creating', delayMs: 1100 },
]

export function useMultiFileToolExecution(): UseMultiFileToolExecutionReturn {
  const [state, setState] = useState<ExecutionState>('idle')
  const [phase, setPhase] = useState<ProcessingPhase>('reading')
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<MultiFileResult[] | null>(null)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }, [])

  const reset = useCallback(() => {
    clearTimers()
    setState('idle')
    setPhase('reading')
    setError(null)
    setResults(null)
  }, [clearTimers])

  const execute = useCallback(
    async (slug: string, files: File[], options?: Record<string, unknown>) => {
      reset()
      setState('processing')

      trackEvent('conversion_start', {
        tool: slug,
        fileCount: files.length,
        totalSize: files.reduce((sum, f) => sum + f.size, 0),
      })

      timeoutsRef.current = PHASE_SCHEDULE.map(({ phase: p, delayMs }) =>
        setTimeout(() => setPhase(p), delayMs),
      )

      const result = await executeMultiFileToolClient(slug, files, options)

      clearTimers()

      if (!result.success) {
        setState('error')
        setError(result.error)
        trackEvent('conversion_error', { tool: slug, error: result.error })
        return
      }

      setPhase('done')
      setResults(result.files)
      setState('done')

      trackEvent('conversion_complete', {
        tool: slug,
        outputSize: result.files.reduce((sum, f) => sum + f.size, 0),
      })
    },
    [reset, clearTimers],
  )

  return { state, phase, error, results, execute, reset }
}
