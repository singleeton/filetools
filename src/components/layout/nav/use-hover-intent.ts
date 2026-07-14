'use client'

import { useCallback, useRef, useState } from 'react'

const OPEN_DELAY_MS = 0
const CLOSE_DELAY_MS = 150

/** Hover-intent open/close with a grace period so moving from the trigger
 * into the panel (across a gap) doesn't close the menu. */
export function useHoverIntent() {
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }

  const onOpen = useCallback(() => {
    clearTimer()
    if (OPEN_DELAY_MS === 0) {
      setOpen(true)
    } else {
      timer.current = setTimeout(() => setOpen(true), OPEN_DELAY_MS)
    }
  }, [])

  const onClose = useCallback(() => {
    clearTimer()
    timer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS)
  }, [])

  const close = useCallback(() => {
    clearTimer()
    setOpen(false)
  }, [])

  return { open, onOpen, onClose, close }
}
