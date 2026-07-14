'use client'

import { useCallback, useMemo, useState } from 'react'
import type { FitMode, ZoomPercent, ZoomValue } from '../types'

export const ZOOM_STEPS: ZoomPercent[] = [25, 50, 75, 100, 125, 150, 200]
export const FIT_MODES: FitMode[] = ['fitWidth', 'fitHeight', 'fitScreen']

const BASE_CARD_WIDTH = 160 // card content width in px at 100% zoom
const MIN_CARD_WIDTH = 64
const MAX_CARD_WIDTH = 420
const ASPECT_RATIO = 1 / 1.5 // width / height, matches the 3:4-ish page preview

export interface UsePdfZoomReturn {
  zoom: ZoomValue
  setZoom: (zoom: ZoomValue) => void
  zoomIn: () => void
  zoomOut: () => void
  isFit: boolean
  cardWidthPx: number
  reportContainerSize: (width: number, height: number) => void
}

export function isFitMode(zoom: ZoomValue): zoom is FitMode {
  return typeof zoom === 'string'
}

/**
 * Centralizes zoom state for the canvas grid: discrete percent steps
 * (25%-200%) plus fit-width/fit-height/fit-screen modes that derive a card
 * width from the last known canvas container size.
 */
export function usePdfZoom(initial: ZoomValue = 100): UsePdfZoomReturn {
  const [zoom, setZoom] = useState<ZoomValue>(initial)
  const [containerSize, setContainerSize] = useState({ width: 960, height: 720 })

  const reportContainerSize = useCallback((width: number, height: number) => {
    setContainerSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }))
  }, [])

  const zoomIn = useCallback(() => {
    setZoom((prev) => {
      const current = isFitMode(prev) ? 100 : prev
      const next = ZOOM_STEPS.find((step) => step > current)
      return next ?? ZOOM_STEPS[ZOOM_STEPS.length - 1]
    })
  }, [])

  const zoomOut = useCallback(() => {
    setZoom((prev) => {
      const current = isFitMode(prev) ? 100 : prev
      const next = [...ZOOM_STEPS].reverse().find((step) => step < current)
      return next ?? ZOOM_STEPS[0]
    })
  }, [])

  const cardWidthPx = useMemo(() => {
    const GAP_ALLOWANCE = 16
    const PADDING_ALLOWANCE = 48

    if (!isFitMode(zoom)) {
      return Math.round(BASE_CARD_WIDTH * (zoom / 100))
    }

    const availWidth = Math.max(containerSize.width - PADDING_ALLOWANCE, 200)
    const availHeight = Math.max(containerSize.height - PADDING_ALLOWANCE, 200)

    const fitWidthValue = (() => {
      const columns = Math.max(1, Math.round(availWidth / 220))
      return availWidth / columns - GAP_ALLOWANCE
    })()

    const fitHeightValue = availHeight * ASPECT_RATIO

    const raw: number =
      zoom === 'fitWidth' ? fitWidthValue : zoom === 'fitHeight' ? fitHeightValue : Math.min(fitWidthValue, fitHeightValue)

    return Math.round(Math.max(MIN_CARD_WIDTH, Math.min(MAX_CARD_WIDTH, raw)))
  }, [zoom, containerSize])

  return { zoom, setZoom, zoomIn, zoomOut, isFit: isFitMode(zoom), cardWidthPx, reportContainerSize }
}
