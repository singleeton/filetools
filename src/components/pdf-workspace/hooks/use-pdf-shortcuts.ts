'use client'

import { useEffect } from 'react'

export interface PdfShortcutHandlers {
  onSelectAll?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onDelete?: () => void
  onSpace?: () => void
  onEscape?: () => void
}

/**
 * Single global keydown listener for the workspace. Kept separate from
 * selection/history state so shortcut wiring (and the ability to disable it,
 * e.g. while a modal is open) lives in one place instead of being scattered
 * across hooks.
 *
 * Shift+click / Ctrl+click are handled at the point of click in
 * `usePdfSelection` — they aren't global key events.
 */
export function usePdfShortcuts(handlers: PdfShortcutHandlers, enabled = true) {
  useEffect(() => {
    if (!enabled) return

    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      const isTyping = target && ['INPUT', 'TEXTAREA'].includes(target.tagName)

      if (e.key === 'Escape') {
        handlers.onEscape?.()
        return
      }

      if (isTyping) return

      if (e.key === ' ') {
        e.preventDefault()
        handlers.onSpace?.()
        return
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        handlers.onDelete?.()
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        handlers.onSelectAll?.()
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        handlers.onRedo?.()
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        handlers.onUndo?.()
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        handlers.onRedo?.()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handlers, enabled])
}
