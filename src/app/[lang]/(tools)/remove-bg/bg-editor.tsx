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

  const wrapperRef = useRef<HTMLDivElement>(null)
  const imgCanvasRef = useRef<HTMLCanvasElement>(null)
  const maskCanvasRef = useRef<HTMLCanvasElement>(null)

  const [loaded, setLoaded] = useState(false)
  const [brushSize, setBrushSize] = useState(30)
  const [mode, setMode] = useState<'brush' | 'eraser'>('brush')
  const [isPainting, setIsPainting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [dims, setDims] = useState({ w: 0, h: 0 })

  const imgElRef = useRef<HTMLImageElement | null>(null)
  const maskDataRef = useRef<Uint8Array | null>(null)
  const historyRef = useRef<Uint8Array[]>([])

  // Load image into offscreen img element
  useEffect(() => {
    const url = URL.createObjectURL(imageFile)
    const img = document.createElement('img')
    img.onload = () => {
      imgElRef.current = img
      const w = img.naturalWidth
      const h = img.naturalHeight
      setDims({ w, h })
      maskDataRef.current = new Uint8Array(w * h)
      historyRef.current = []
      setLoaded(true)
    }
    img.src = url
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  // Draw whenever loaded changes or preview toggles
  const draw = useCallback(() => {
    const imgCanvas = imgCanvasRef.current
    const maskCanvas = maskCanvasRef.current
    const img = imgElRef.current
    const mask = maskDataRef.current
    if (!imgCanvas || !maskCanvas || !img || !mask) return

    const w = img.naturalWidth
    const h = img.naturalHeight

    // Ensure canvas sizes match
    if (imgCanvas.width !== w) imgCanvas.width = w
    if (imgCanvas.height !== h) imgCanvas.height = h
    if (maskCanvas.width !== w) maskCanvas.width = w
    if (maskCanvas.height !== h) maskCanvas.height = h

    const imgCtx = imgCanvas.getContext('2d')!
    const maskCtx = maskCanvas.getContext('2d')!

    if (showPreview) {
      // Checkerboard background
      imgCtx.clearRect(0, 0, w, h)
      const tile = 12
      for (let y = 0; y < h; y += tile) {
        for (let x = 0; x < w; x += tile) {
          imgCtx.fillStyle = ((x / tile + y / tile) % 2) === 0 ? '#1a1a1a' : '#2d2d2d'
          imgCtx.fillRect(x, y, tile, tile)
        }
      }
      // Draw original image
      imgCtx.drawImage(img, 0, 0)
      // Punch out masked areas
      const imgData = imgCtx.getImageData(0, 0, w, h)
      const px = imgData.data
      for (let i = 0; i < mask.length; i++) {
        if (mask[i] === 1) {
          const idx = i * 4
          px[idx + 3] = 0
        }
      }
      imgCtx.putImageData(imgData, 0, 0)
      // Hide mask overlay
      maskCtx.clearRect(0, 0, w, h)
    } else {
      // Draw original image cleanly
      imgCtx.clearRect(0, 0, w, h)
      imgCtx.drawImage(img, 0, 0)
      // Draw red overlay on masked areas
      maskCtx.clearRect(0, 0, w, h)
      const maskImgData = maskCtx.createImageData(w, h)
      const mp = maskImgData.data
      for (let i = 0; i < mask.length; i++) {
        if (mask[i] === 1) {
          const idx = i * 4
          mp[idx] = 255     // R
          mp[idx + 1] = 50  // G
          mp[idx + 2] = 50  // B
          mp[idx + 3] = 120 // A (semi-transparent)
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
    const val = mode === 'brush' ? 1 : 0

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
    maskDataRef.current?.fill(0)
    historyRef.current = []
    draw()
  }, [draw])

  const download = useCallback(() => {
    const img = imgElRef.current
    const mask = maskDataRef.current
    if (!img || !mask) return

    trackEvent('download_click', { fileName: 'removed-bg.png' })

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

  const doZoom = useCallback((dir: 'in' | 'out') => {
    setZoom(z => dir === 'in' ? Math.min(z + 0.25, 3) : Math.max(z - 0.25, 0.25))
  }, [])

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
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3">
        <div className="flex items-center gap-1">
          <Button size="sm" variant={mode === 'brush' ? 'default' : 'outline'} onClick={() => setMode('brush')}>
            <Paintbrush className="mr-1.5 h-4 w-4" />
            {t.brush}
          </Button>
          <Button size="sm" variant={mode === 'eraser' ? 'default' : 'outline'} onClick={() => setMode('eraser')}>
            <Eraser className="mr-1.5 h-4 w-4" />
            {t.eraser}
          </Button>
        </div>

        <div className="mx-2 h-6 w-px bg-border" />

        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground whitespace-nowrap">{t.brushSize}</label>
          <input type="range" min={5} max={100} value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="w-24 accent-primary" />
          <span className="text-xs text-muted-foreground w-6 text-right">{brushSize}</span>
        </div>

        <div className="mx-2 h-6 w-px bg-border" />

        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" onClick={() => doZoom('out')}><ZoomOut className="h-4 w-4" /></Button>
          <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
          <Button size="sm" variant="outline" onClick={() => doZoom('in')}><ZoomIn className="h-4 w-4" /></Button>
        </div>

        <div className="mx-2 h-6 w-px bg-border" />

        <Button size="sm" variant="outline" onClick={undo}>
          <Undo2 className="mr-1.5 h-4 w-4" />{t.undo}
        </Button>
        <Button size="sm" variant="outline" onClick={resetMask}>
          <RotateCcw className="mr-1.5 h-4 w-4" />{t.reset}
        </Button>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2">
        <button onClick={() => setShowPreview(false)} className={cn('rounded-md px-3 py-1.5 text-sm font-medium transition-colors', !showPreview ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
          {t.original}
        </button>
        <button onClick={() => setShowPreview(true)} className={cn('rounded-md px-3 py-1.5 text-sm font-medium transition-colors', showPreview ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
          {t.preview}
        </button>
        <p className="ml-auto text-xs text-muted-foreground">{t.paintToRemove}</p>
      </div>

      {/* Canvas area — two stacked canvases */}
      <div
        ref={wrapperRef}
        className="overflow-auto rounded-lg border bg-card"
        style={{ maxHeight: '70vh' }}
      >
        <div
          style={{ position: 'relative', width: `${zoom * 100}%`, maxWidth: dims.w * zoom }}
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
          onMouseLeave={onUp}
        >
          <canvas ref={imgCanvasRef} style={cStyle} className="cursor-crosshair" />
          <canvas ref={maskCanvasRef} style={{ ...cStyle, position: 'absolute', top: 0, left: 0 }} className="cursor-crosshair pointer-events-none" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-3">
        <Button size="lg" onClick={download}>
          <Download className="mr-2 h-4 w-4" />{t.download}
        </Button>
        <Button size="lg" variant="outline" onClick={onReset}>
          <RotateCcw className="mr-2 h-4 w-4" />{dict.ui.download.startOver}
        </Button>
      </div>
    </div>
  )
}
