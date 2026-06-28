'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, RotateCcw, Undo2, Paintbrush, Eraser, ZoomIn, ZoomOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDictionary } from '@/lib/i18n/dictionary-context'
import { trackEvent } from '@/lib/analytics'

interface BgEditorProps {
  imageFile: File
  onReset: () => void
}

export function BgEditor({ imageFile, onReset }: BgEditorProps) {
  const { dict } = useDictionary()
  const t = dict.removeBg

  const displayCanvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [loaded, setLoaded] = useState(false)
  const [brushSize, setBrushSize] = useState(20)
  const [mode, setMode] = useState<'brush' | 'eraser'>('brush')
  const [isPainting, setIsPainting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [imgDims, setImgDims] = useState({ w: 0, h: 0 })

  const originalDataRef = useRef<ImageData | null>(null)
  const maskRef = useRef<Uint8Array | null>(null)
  const historyRef = useRef<Uint8Array[]>([])
  const imgRef = useRef<HTMLImageElement | null>(null)

  const renderDisplay = useCallback((showPrev: boolean) => {
    const canvas = displayCanvasRef.current
    const original = originalDataRef.current
    const mask = maskRef.current
    if (!canvas || !original || !mask) return

    const ctx = canvas.getContext('2d')!
    const w = canvas.width
    const h = canvas.height

    if (showPrev) {
      ctx.clearRect(0, 0, w, h)
      const tileSize = 10
      for (let ty = 0; ty < h; ty += tileSize) {
        for (let tx = 0; tx < w; tx += tileSize) {
          const isEven = ((tx / tileSize + ty / tileSize) % 2) === 0
          ctx.fillStyle = isEven ? '#2a2a2a' : '#3a3a3a'
          ctx.fillRect(tx, ty, tileSize, tileSize)
        }
      }
      const imgData = ctx.createImageData(w, h)
      const src = original.data
      const dst = imgData.data
      for (let i = 0; i < mask.length; i++) {
        const idx = i * 4
        if (mask[i] === 0) {
          dst[idx] = src[idx]
          dst[idx + 1] = src[idx + 1]
          dst[idx + 2] = src[idx + 2]
          dst[idx + 3] = src[idx + 3]
        }
      }
      ctx.putImageData(imgData, 0, 0)
    } else {
      const imgData = ctx.createImageData(w, h)
      const src = original.data
      const dst = imgData.data
      for (let i = 0; i < mask.length; i++) {
        const idx = i * 4
        if (mask[i] === 1) {
          const origR = src[idx], origG = src[idx + 1], origB = src[idx + 2]
          dst[idx] = Math.min(255, Math.floor(origR * 0.4 + 255 * 0.6))
          dst[idx + 1] = Math.floor(origG * 0.4 + 60 * 0.6)
          dst[idx + 2] = Math.floor(origB * 0.4 + 60 * 0.6)
          dst[idx + 3] = 255
        } else {
          dst[idx] = src[idx]
          dst[idx + 1] = src[idx + 1]
          dst[idx + 2] = src[idx + 2]
          dst[idx + 3] = src[idx + 3]
        }
      }
      ctx.putImageData(imgData, 0, 0)
    }
  }, [])

  useEffect(() => {
    const url = URL.createObjectURL(imageFile)
    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      const w = img.naturalWidth
      const h = img.naturalHeight
      setImgDims({ w, h })

      const canvas = displayCanvasRef.current
      if (!canvas) return

      canvas.width = w
      canvas.height = h

      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)

      originalDataRef.current = ctx.getImageData(0, 0, w, h)
      maskRef.current = new Uint8Array(w * h)
      historyRef.current = []

      setLoaded(true)
    }
    img.src = url
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  useEffect(() => {
    if (loaded) renderDisplay(showPreview)
  }, [loaded, showPreview, renderDisplay])

  const saveHistory = useCallback(() => {
    const mask = maskRef.current
    if (!mask) return
    historyRef.current.push(new Uint8Array(mask))
    if (historyRef.current.length > 50) historyRef.current.shift()
  }, [])

  const getCanvasPos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = displayCanvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    }
  }, [])

  const paint = useCallback((x: number, y: number, currentShowPreview: boolean) => {
    const canvas = displayCanvasRef.current
    const mask = maskRef.current
    if (!canvas || !mask) return

    const scale = canvas.width / (containerRef.current?.clientWidth || canvas.width)
    const radius = brushSize * scale
    const w = canvas.width
    const h = canvas.height

    const startX = Math.max(0, Math.floor(x - radius))
    const startY = Math.max(0, Math.floor(y - radius))
    const endX = Math.min(w, Math.ceil(x + radius))
    const endY = Math.min(h, Math.ceil(y + radius))
    const rSq = radius * radius
    const value = mode === 'brush' ? 1 : 0

    for (let py = startY; py < endY; py++) {
      for (let px = startX; px < endX; px++) {
        const dx = px - x
        const dy = py - y
        if (dx * dx + dy * dy <= rSq) {
          mask[py * w + px] = value
        }
      }
    }

    renderDisplay(currentShowPreview)
  }, [brushSize, mode, renderDisplay])

  const showPreviewRef = useRef(showPreview)
  showPreviewRef.current = showPreview

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    saveHistory()
    setIsPainting(true)
    const pos = getCanvasPos(e)
    paint(pos.x, pos.y, showPreviewRef.current)
  }, [saveHistory, getCanvasPos, paint])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPainting) return
    const pos = getCanvasPos(e)
    paint(pos.x, pos.y, showPreviewRef.current)
  }, [isPainting, getCanvasPos, paint])

  const handleMouseUp = useCallback(() => {
    setIsPainting(false)
  }, [])

  const handleUndo = useCallback(() => {
    if (historyRef.current.length === 0 || !maskRef.current) return
    maskRef.current = historyRef.current.pop()!
    renderDisplay(showPreviewRef.current)
  }, [renderDisplay])

  const handleResetCanvas = useCallback(() => {
    if (!maskRef.current) return
    maskRef.current.fill(0)
    historyRef.current = []
    renderDisplay(showPreviewRef.current)
  }, [renderDisplay])

  const handleDownload = useCallback(() => {
    const original = originalDataRef.current
    const mask = maskRef.current
    if (!original || !mask) return

    trackEvent('download_click', { fileName: 'removed-bg.png' })

    const offscreen = document.createElement('canvas')
    offscreen.width = original.width
    offscreen.height = original.height
    const ctx = offscreen.getContext('2d')!
    const imgData = ctx.createImageData(original.width, original.height)
    const src = original.data
    const dst = imgData.data
    for (let i = 0; i < mask.length; i++) {
      const idx = i * 4
      dst[idx] = src[idx]
      dst[idx + 1] = src[idx + 1]
      dst[idx + 2] = src[idx + 2]
      dst[idx + 3] = mask[i] === 1 ? 0 : src[idx + 3]
    }
    ctx.putImageData(imgData, 0, 0)

    offscreen.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = imageFile.name.replace(/\.[^.]+$/, '-nobg.png')
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 'image/png')
  }, [imageFile.name])

  const handleZoom = useCallback((dir: 'in' | 'out') => {
    setZoom((z) => dir === 'in' ? Math.min(z + 0.25, 3) : Math.max(z - 0.25, 0.25))
  }, [])

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const canvasStyle = {
    width: `${100 * zoom}%`,
    maxWidth: `${imgDims.w * zoom}px`,
    height: 'auto',
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3">
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant={mode === 'brush' ? 'default' : 'outline'}
            onClick={() => setMode('brush')}
          >
            <Paintbrush className="mr-1.5 h-4 w-4" />
            {t.brush}
          </Button>
          <Button
            size="sm"
            variant={mode === 'eraser' ? 'default' : 'outline'}
            onClick={() => setMode('eraser')}
          >
            <Eraser className="mr-1.5 h-4 w-4" />
            {t.eraser}
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

        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" onClick={() => handleZoom('out')}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
          <Button size="sm" variant="outline" onClick={() => handleZoom('in')}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <div className="mx-2 h-6 w-px bg-border" />

        <Button size="sm" variant="outline" onClick={handleUndo}>
          <Undo2 className="mr-1.5 h-4 w-4" />
          {t.undo}
        </Button>
        <Button size="sm" variant="outline" onClick={handleResetCanvas}>
          <RotateCcw className="mr-1.5 h-4 w-4" />
          {t.reset}
        </Button>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowPreview(false)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            !showPreview ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {t.original}
        </button>
        <button
          onClick={() => setShowPreview(true)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            showPreview ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {t.preview}
        </button>
        <p className="ml-auto text-xs text-muted-foreground">{t.paintToRemove}</p>
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        className="overflow-auto rounded-lg border bg-card"
        style={{ maxHeight: '70vh' }}
      >
        <canvas
          ref={displayCanvasRef}
          className="cursor-crosshair"
          style={canvasStyle}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-3">
        <Button size="lg" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          {t.download}
        </Button>
        <Button size="lg" variant="outline" onClick={onReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          {dict.ui.download.startOver}
        </Button>
      </div>
    </div>
  )
}
