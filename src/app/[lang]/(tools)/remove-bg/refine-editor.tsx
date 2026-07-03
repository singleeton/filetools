'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Undo2, RotateCcw, Paintbrush, Eraser } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDictionary } from '@/lib/i18n/dictionary-context'

interface RefineEditorProps {
  originalUrl: string
  resultUrl: string
  onApply: (blob: Blob) => void
  onCancel: () => void
}

function loadImageEl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img')
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export function RefineEditor({ originalUrl, resultUrl, onApply, onCancel }: RefineEditorProps) {
  const { dict } = useDictionary()
  const t = dict.removeBg

  const wrapperRef = useRef<HTMLDivElement>(null)
  const imgCanvasRef = useRef<HTMLCanvasElement>(null)
  const maskCanvasRef = useRef<HTMLCanvasElement>(null)

  const [loaded, setLoaded] = useState(false)
  const [brushSize, setBrushSize] = useState(30)
  const [mode, setMode] = useState<'erase' | 'restore'>('restore')
  const [isPainting, setIsPainting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [dims, setDims] = useState({ w: 0, h: 0 })

  const imgElRef = useRef<HTMLImageElement | null>(null)
  const maskDataRef = useRef<Uint8Array | null>(null)
  const initialMaskRef = useRef<Uint8Array | null>(null)
  const historyRef = useRef<Uint8Array[]>([])

  // Load the original image + decode the AI result's alpha channel into a starting mask
  useEffect(() => {
    let cancelled = false

    Promise.all([loadImageEl(originalUrl), loadImageEl(resultUrl)]).then(([origImg, resImg]) => {
      if (cancelled) return
      const w = origImg.naturalWidth
      const h = origImg.naturalHeight
      imgElRef.current = origImg

      const off = document.createElement('canvas')
      off.width = w
      off.height = h
      const octx = off.getContext('2d')!
      octx.drawImage(resImg, 0, 0, w, h)
      const alpha = octx.getImageData(0, 0, w, h).data

      const mask = new Uint8Array(w * h)
      for (let i = 0; i < mask.length; i++) {
        mask[i] = alpha[i * 4 + 3] < 128 ? 1 : 0
      }
      maskDataRef.current = mask
      initialMaskRef.current = new Uint8Array(mask)
      historyRef.current = []
      setDims({ w, h })
      setLoaded(true)
    })

    return () => {
      cancelled = true
    }
  }, [originalUrl, resultUrl])

  const draw = useCallback(() => {
    const imgCanvas = imgCanvasRef.current
    const maskCanvas = maskCanvasRef.current
    const img = imgElRef.current
    const mask = maskDataRef.current
    if (!imgCanvas || !maskCanvas || !img || !mask) return

    const w = img.naturalWidth
    const h = img.naturalHeight
    if (imgCanvas.width !== w) imgCanvas.width = w
    if (imgCanvas.height !== h) imgCanvas.height = h
    if (maskCanvas.width !== w) maskCanvas.width = w
    if (maskCanvas.height !== h) maskCanvas.height = h

    const imgCtx = imgCanvas.getContext('2d')!
    const maskCtx = maskCanvas.getContext('2d')!

    if (showPreview) {
      imgCtx.clearRect(0, 0, w, h)
      imgCtx.drawImage(img, 0, 0)
      const imgData = imgCtx.getImageData(0, 0, w, h)
      const px = imgData.data
      for (let i = 0; i < mask.length; i++) {
        if (mask[i] === 1) px[i * 4 + 3] = 0
      }
      imgCtx.putImageData(imgData, 0, 0)
      maskCtx.clearRect(0, 0, w, h)
    } else {
      imgCtx.clearRect(0, 0, w, h)
      imgCtx.drawImage(img, 0, 0)
      maskCtx.clearRect(0, 0, w, h)
      const maskImgData = maskCtx.createImageData(w, h)
      const mp = maskImgData.data
      for (let i = 0; i < mask.length; i++) {
        if (mask[i] === 1) {
          const idx = i * 4
          mp[idx] = 255
          mp[idx + 1] = 50
          mp[idx + 2] = 50
          mp[idx + 3] = 120
        }
      }
      maskCtx.putImageData(maskImgData, 0, 0)
    }
  }, [showPreview])

  useEffect(() => {
    if (loaded) draw()
  }, [loaded, draw])

  const saveHistory = useCallback(() => {
    const mask = maskDataRef.current
    if (!mask) return
    historyRef.current.push(new Uint8Array(mask))
    if (historyRef.current.length > 50) historyRef.current.shift()
  }, [])

  const getPos = useCallback((e: React.MouseEvent) => {
    const canvas = imgCanvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    }
  }, [])

  const paintAt = useCallback((x: number, y: number) => {
    const mask = maskDataRef.current
    if (!mask || !dims.w) return

    const wrapper = wrapperRef.current
    const canvasW = dims.w
    const displayW = wrapper?.clientWidth || canvasW
    const scale = canvasW / displayW
    const radius = brushSize * scale
    const rSq = radius * radius
    const val = mode === 'erase' ? 1 : 0

    const x0 = Math.max(0, Math.floor(x - radius))
    const y0 = Math.max(0, Math.floor(y - radius))
    const x1 = Math.min(canvasW, Math.ceil(x + radius))
    const y1 = Math.min(dims.h, Math.ceil(y + radius))

    for (let py = y0; py < y1; py++) {
      for (let px = x0; px < x1; px++) {
        if ((px - x) ** 2 + (py - y) ** 2 <= rSq) {
          mask[py * canvasW + px] = val
        }
      }
    }
    draw()
  }, [brushSize, mode, dims, draw])

  const onDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    saveHistory()
    setIsPainting(true)
    const p = getPos(e)
    paintAt(p.x, p.y)
  }, [saveHistory, getPos, paintAt])

  const onMove = useCallback((e: React.MouseEvent) => {
    if (!isPainting) return
    const p = getPos(e)
    paintAt(p.x, p.y)
  }, [isPainting, getPos, paintAt])

  const onUp = useCallback(() => setIsPainting(false), [])

  const undo = useCallback(() => {
    if (!historyRef.current.length) return
    maskDataRef.current = historyRef.current.pop()!
    draw()
  }, [draw])

  const resetMask = useCallback(() => {
    if (!initialMaskRef.current) return
    maskDataRef.current = new Uint8Array(initialMaskRef.current)
    historyRef.current = []
    draw()
  }, [draw])

  const apply = useCallback(() => {
    const img = imgElRef.current
    const mask = maskDataRef.current
    if (!img || !mask) return

    const c = document.createElement('canvas')
    c.width = img.naturalWidth
    c.height = img.naturalHeight
    const ctx = c.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    const d = ctx.getImageData(0, 0, c.width, c.height)
    for (let i = 0; i < mask.length; i++) {
      if (mask[i] === 1) d.data[i * 4 + 3] = 0
    }
    ctx.putImageData(d, 0, 0)

    c.toBlob((blob) => {
      if (blob) onApply(blob)
    }, 'image/png')
  }, [onApply])

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const cStyle: React.CSSProperties = {
    width: '100%',
    height: 'auto',
    display: 'block',
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3">
        <div className="flex items-center gap-1">
          <Button size="sm" variant={mode === 'restore' ? 'default' : 'outline'} onClick={() => setMode('restore')}>
            <Eraser className="mr-1.5 h-4 w-4" />
            {t.restore}
          </Button>
          <Button size="sm" variant={mode === 'erase' ? 'default' : 'outline'} onClick={() => setMode('erase')}>
            <Paintbrush className="mr-1.5 h-4 w-4" />
            {t.erase}
          </Button>
        </div>

        <div className="mx-2 h-6 w-px bg-border" />

        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground whitespace-nowrap">{t.brushSize}</label>
          <input
            type="range"
            min={5}
            max={100}
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-24 accent-primary"
          />
          <span className="text-xs text-muted-foreground w-6 text-right">{brushSize}</span>
        </div>

        <div className="mx-2 h-6 w-px bg-border" />

        <Button size="sm" variant="outline" onClick={undo}>
          <Undo2 className="mr-1.5 h-4 w-4" />
          {t.undo}
        </Button>
        <Button size="sm" variant="outline" onClick={resetMask}>
          <RotateCcw className="mr-1.5 h-4 w-4" />
          {t.resetMask}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowPreview(false)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            !showPreview ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {t.editView}
        </button>
        <button
          onClick={() => setShowPreview(true)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            showPreview ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {t.previewView}
        </button>
        <p className="ml-auto text-xs text-muted-foreground">{t.refineHint}</p>
      </div>

      <div ref={wrapperRef} className="overflow-auto rounded-lg border bg-card" style={{ maxHeight: '70vh' }}>
        <div
          style={{
            position: 'relative',
            ...(showPreview
              ? {
                  backgroundImage: 'repeating-conic-gradient(#1a1a1a 0% 25%, #2d2d2d 0% 50%)',
                  backgroundSize: '24px 24px',
                }
              : {}),
          }}
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
          onMouseLeave={onUp}
        >
          <canvas ref={imgCanvasRef} style={cStyle} className="cursor-crosshair" />
          <canvas
            ref={maskCanvasRef}
            style={{ ...cStyle, position: 'absolute', top: 0, left: 0 }}
            className="cursor-crosshair pointer-events-none"
          />
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <Button size="lg" onClick={apply}>
          {t.apply}
        </Button>
        <Button size="lg" variant="outline" onClick={onCancel}>
          {t.cancel}
        </Button>
      </div>
    </div>
  )
}
