'use client'

import { useCallback, useRef } from 'react'
import { X } from 'lucide-react'

export interface SignatureRect {
  xPct: number
  yPct: number
  wPct: number
  hPct: number
}

interface DragState {
  mode: 'move' | 'resize'
  startX: number
  startY: number
  startRect: SignatureRect
  containerW: number
  containerH: number
}

interface SignatureOverlayProps {
  imageUrl: string
  rect: SignatureRect
  aspectRatio: number
  containerRef: React.RefObject<HTMLDivElement | null>
  onChange: (rect: SignatureRect) => void
  onRemove: () => void
  removeLabel: string
}

const MIN_W_PCT = 0.04

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

export function SignatureOverlay({
  imageUrl,
  rect,
  aspectRatio,
  containerRef,
  onChange,
  onRemove,
  removeLabel,
}: SignatureOverlayProps) {
  const dragState = useRef<DragState | null>(null)

  const beginDrag = useCallback(
    (e: React.PointerEvent, mode: 'move' | 'resize') => {
      e.preventDefault()
      e.stopPropagation()
      const container = containerRef.current
      if (!container) return

      const bounds = container.getBoundingClientRect()
      dragState.current = {
        mode,
        startX: e.clientX,
        startY: e.clientY,
        startRect: rect,
        containerW: bounds.width,
        containerH: bounds.height,
      }
      ;(e.target as Element).setPointerCapture(e.pointerId)
    },
    [containerRef, rect],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const state = dragState.current
      if (!state) return

      const dxPct = (e.clientX - state.startX) / state.containerW
      const dyPct = (e.clientY - state.startY) / state.containerH

      if (state.mode === 'move') {
        const xPct = clamp(state.startRect.xPct + dxPct, 0, 1 - state.startRect.wPct)
        const yPct = clamp(state.startRect.yPct + dyPct, 0, 1 - state.startRect.hPct)
        onChange({ ...state.startRect, xPct, yPct })
      } else {
        const wPct = clamp(state.startRect.wPct + dxPct, MIN_W_PCT, 1 - state.startRect.xPct)
        const hPctRaw = (wPct * state.containerW) / aspectRatio / state.containerH
        const hPct = clamp(hPctRaw, MIN_W_PCT, 1 - state.startRect.yPct)
        onChange({ ...state.startRect, wPct, hPct })
      }
    },
    [onChange, aspectRatio],
  )

  const endDrag = useCallback(() => {
    dragState.current = null
  }, [])

  return (
    <div
      className="group absolute border-2 border-primary/70 bg-primary/5"
      style={{
        left: `${rect.xPct * 100}%`,
        top: `${rect.yPct * 100}%`,
        width: `${rect.wPct * 100}%`,
        height: `${rect.hPct * 100}%`,
        touchAction: 'none',
        cursor: 'move',
      }}
      onPointerDown={(e) => beginDrag(e, 'move')}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt="" className="pointer-events-none h-full w-full object-contain" draggable={false} />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        aria-label={removeLabel}
        className="absolute -right-2.5 -top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
      >
        <X className="h-3 w-3" />
      </button>

      <div
        onPointerDown={(e) => beginDrag(e, 'resize')}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        style={{ touchAction: 'none' }}
        className="absolute -bottom-1.5 -right-1.5 h-4 w-4 cursor-nwse-resize rounded-full border-2 border-background bg-primary"
      />
    </div>
  )
}
