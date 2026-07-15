'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHoverIntent } from './use-hover-intent'

interface NavDropdownProps {
  label: string
  href?: string
  disabled?: boolean
  panelClassName?: string
  /** Anchor edge for the panel — avoids clipping off-screen for triggers
   * near the left/right edge of the header. Defaults to 'left'. */
  align?: 'left' | 'right'
  children: (close: () => void) => React.ReactNode
}

/** Hover-opened dropdown trigger + glassmorphism panel. Doubles as the
 * "MegaMenu" root and "DropdownAnimation" wrapper — every category/Tools
 * menu renders through this one component. */
export function NavDropdown({ label, href, disabled, panelClassName, align = 'left', children }: NavDropdownProps) {
  const { open, onOpen, onClose, close } = useHoverIntent()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        close()
        rootRef.current?.querySelector<HTMLElement>('[data-nav-trigger]')?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, close])

  if (disabled) {
    return (
      <span className="cursor-default text-sm font-medium text-muted-foreground/50 select-none">
        {label}
      </span>
    )
  }

  const trigger = href ? (
    <Link
      href={href}
      data-nav-trigger
      className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      {label}
      <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', open && 'rotate-180')} />
    </Link>
  ) : (
    <button
      type="button"
      data-nav-trigger
      aria-haspopup="true"
      aria-expanded={open}
      onFocus={onOpen}
      className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      {label}
      <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', open && 'rotate-180')} />
    </button>
  )

  return (
    <div ref={rootRef} className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      {trigger}
      <div
        role="menu"
        className={cn(
          'absolute top-full z-50 max-w-[calc(100vw-2rem)] pt-3 transition-all duration-200 ease-out',
          align === 'left' ? 'left-0' : 'right-0',
          open
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-1 opacity-0',
        )}
        style={{ willChange: 'transform, opacity' }}
      >
        <div
          className={cn(
            'overflow-hidden rounded-2xl border border-white/10 bg-background shadow-2xl shadow-black/10 supports-[backdrop-filter]:bg-background/95 supports-[backdrop-filter]:backdrop-blur-xl',
            panelClassName,
          )}
        >
          {open && children(close)}
        </div>
      </div>
    </div>
  )
}
