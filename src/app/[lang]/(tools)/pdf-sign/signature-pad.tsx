'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Dancing_Script, Caveat } from 'next/font/google'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDictionary } from '@/lib/i18n/dictionary-context'

const dancingScript = Dancing_Script({ subsets: ['latin'], weight: ['700'] })
const caveat = Caveat({ subsets: ['latin'], weight: ['700'] })

const FONTS = {
  dancing: dancingScript,
  caveat,
} as const

type FontChoice = keyof typeof FONTS

interface SelectedSignature {
  dataUrl: string
  aspectRatio: number
}

interface SavedSignature {
  id: string
  url: string
  createdAt: string
}

interface SignaturePadProps {
  onSelect: (signature: SelectedSignature) => void
}

function loadImageDims(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = reject
    img.src = dataUrl
  })
}

function urlToDataUrl(url: string): Promise<string> {
  return fetch(url)
    .then((res) => res.blob())
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        }),
    )
}

function trimTransparentCanvas(canvas: HTMLCanvasElement, padding = 6): HTMLCanvasElement | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)

  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3]
      if (alpha > 10) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  if (maxX < minX || maxY < minY) return null

  minX = Math.max(0, minX - padding)
  minY = Math.max(0, minY - padding)
  maxX = Math.min(width - 1, maxX + padding)
  maxY = Math.min(height - 1, maxY + padding)

  const trimmed = document.createElement('canvas')
  trimmed.width = maxX - minX + 1
  trimmed.height = maxY - minY + 1
  const tctx = trimmed.getContext('2d')!
  tctx.drawImage(canvas, minX, minY, trimmed.width, trimmed.height, 0, 0, trimmed.width, trimmed.height)
  return trimmed
}

export function SignaturePad({ onSelect }: SignaturePadProps) {
  const { dict } = useDictionary()
  const t = dict.sign

  const [tab, setTab] = useState<'draw' | 'upload' | 'type'>('draw')
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [saved, setSaved] = useState<SavedSignature[]>([])
  const [savedLoading, setSavedLoading] = useState(false)
  const [saveNew, setSaveNew] = useState(true)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)
  const hasInkRef = useRef(false)

  const [uploadPreview, setUploadPreview] = useState<{ dataUrl: string; width: number; height: number } | null>(null)
  const [typedName, setTypedName] = useState('')
  const [font, setFont] = useState<FontChoice>('dancing')

  const refreshSaved = useCallback(async () => {
    setSavedLoading(true)
    try {
      const res = await fetch('/api/signatures')
      const json = await res.json()
      setSaved(json.signatures ?? [])
    } finally {
      setSavedLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((json) => {
        setUser(json.user)
        if (json.user) refreshSaved()
      })
      .catch(() => setUser(null))
  }, [refreshSaved])

  const persistIfRequested = useCallback(
    async (dataUrl: string) => {
      if (!user || !saveNew) return
      try {
        await fetch('/api/signatures', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl }),
        })
        refreshSaved()
      } catch {
        // saving is a convenience, not required for the current signature to work
      }
    },
    [user, saveNew, refreshSaved],
  )

  const finalize = useCallback(
    (dataUrl: string, aspectRatio: number) => {
      onSelect({ dataUrl, aspectRatio })
      persistIfRequested(dataUrl)
    },
    [onSelect, persistIfRequested],
  )

  // --- Draw tab ---

  const getCanvasPos = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    }
  }, [])

  const handleDrawStart = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')!
      const { x, y } = getCanvasPos(e)
      isDrawingRef.current = true
      hasInkRef.current = true
      ctx.beginPath()
      ctx.moveTo(x, y)
      canvas.setPointerCapture(e.pointerId)
    },
    [getCanvasPos],
  )

  const handleDrawMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) return
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')!
      const { x, y } = getCanvasPos(e)
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = '#111827'
      ctx.lineTo(x, y)
      ctx.stroke()
    },
    [getCanvasPos],
  )

  const handleDrawEnd = useCallback(() => {
    isDrawingRef.current = false
  }, [])

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height)
    hasInkRef.current = false
  }, [])

  const confirmDrawnSignature = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !hasInkRef.current) return
    const trimmed = trimTransparentCanvas(canvas)
    if (!trimmed) return
    finalize(trimmed.toDataURL('image/png'), trimmed.width / trimmed.height)
  }, [finalize])

  // --- Upload tab ---

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      const { width, height } = await loadImageDims(dataUrl)
      setUploadPreview({ dataUrl, width, height })
    }
    reader.readAsDataURL(file)
  }, [])

  const confirmUploadedSignature = useCallback(() => {
    if (!uploadPreview) return
    finalize(uploadPreview.dataUrl, uploadPreview.width / uploadPreview.height)
  }, [uploadPreview, finalize])

  // --- Type tab ---

  const confirmTypedSignature = useCallback(async () => {
    const name = typedName.trim()
    if (!name) return

    const family = FONTS[font].style.fontFamily
    const fontSpec = `64px ${family}`
    await document.fonts.load(fontSpec)

    const measure = document.createElement('canvas').getContext('2d')!
    measure.font = fontSpec
    const width = Math.ceil(measure.measureText(name).width) + 40
    const height = 140

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!
    ctx.font = fontSpec
    ctx.fillStyle = '#111827'
    ctx.textBaseline = 'middle'
    ctx.fillText(name, 20, height / 2)

    const trimmed = trimTransparentCanvas(canvas)
    if (!trimmed) return
    finalize(trimmed.toDataURL('image/png'), trimmed.width / trimmed.height)
  }, [typedName, font, finalize])

  // --- Saved signatures ---

  const selectSavedSignature = useCallback(
    async (sig: SavedSignature) => {
      const dataUrl = await urlToDataUrl(sig.url)
      const { width, height } = await loadImageDims(dataUrl)
      onSelect({ dataUrl, aspectRatio: width / height })
    },
    [onSelect],
  )

  const deleteSavedSignature = useCallback(
    async (id: string) => {
      await fetch(`/api/signatures/${id}`, { method: 'DELETE' })
      refreshSaved()
    },
    [refreshSaved],
  )

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      {user && saved.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">{t.savedSignatures.title}</p>
          <div className="flex flex-wrap gap-2">
            {saved.map((sig) => (
              <div key={sig.id} className="group relative rounded-md border bg-background p-2">
                <button type="button" onClick={() => selectSavedSignature(sig)} className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sig.url} alt="" className="h-10 w-24 object-contain" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteSavedSignature(sig.id)}
                  aria-label={t.savedSignatures.delete}
                  className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground group-hover:flex"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {user && saved.length === 0 && !savedLoading && (
        <p className="text-sm text-muted-foreground">{t.savedSignatures.empty}</p>
      )}
      {!user && <p className="text-xs text-muted-foreground">{t.savedSignatures.loginHint}</p>}

      <div className="flex gap-1 rounded-md bg-muted p-1">
        {(['draw', 'upload', 'type'] as const).map((tabId) => (
          <button
            key={tabId}
            type="button"
            onClick={() => setTab(tabId)}
            className={cn(
              'flex-1 rounded px-3 py-1.5 text-sm font-medium transition-colors',
              tab === tabId ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t.tabs[tabId]}
          </button>
        ))}
      </div>

      {tab === 'draw' && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">{t.draw.hint}</p>
          <canvas
            ref={canvasRef}
            width={600}
            height={200}
            className="w-full touch-none rounded-md border bg-white"
            style={{ touchAction: 'none' }}
            onPointerDown={handleDrawStart}
            onPointerMove={handleDrawMove}
            onPointerUp={handleDrawEnd}
            onPointerLeave={handleDrawEnd}
          />
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" size="sm" onClick={clearCanvas}>
              {t.draw.clear}
            </Button>
            {user && <SaveToggle checked={saveNew} onChange={setSaveNew} label={t.savedSignatures.saveOption} />}
            <Button size="sm" onClick={confirmDrawnSignature}>
              {t.draw.use}
            </Button>
          </div>
        </div>
      )}

      {tab === 'upload' && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">{t.upload.hint}</p>
          <input type="file" accept="image/png,image/jpeg" onChange={handleFileChange} className="text-sm" />
          {uploadPreview && (
            <div className="flex items-center justify-between gap-3 rounded-md border bg-background p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={uploadPreview.dataUrl} alt="" className="h-12 max-w-[50%] object-contain" />
              <div className="flex items-center gap-3">
                {user && <SaveToggle checked={saveNew} onChange={setSaveNew} label={t.savedSignatures.saveOption} />}
                <Button size="sm" onClick={confirmUploadedSignature}>
                  {t.upload.use}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'type' && (
        <div className="space-y-3">
          <input
            type="text"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder={t.type.placeholder}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{t.type.fontLabel}</span>
            {(Object.keys(FONTS) as FontChoice[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setFont(id)}
                className={cn(
                  'rounded-md border px-3 py-1.5 text-lg',
                  FONTS[id].className,
                  font === id ? 'border-primary bg-primary/5' : '',
                )}
              >
                {typedName || 'Signature'}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-end gap-3">
            {user && <SaveToggle checked={saveNew} onChange={setSaveNew} label={t.savedSignatures.saveOption} />}
            <Button size="sm" onClick={confirmTypedSignature} disabled={!typedName.trim()}>
              {t.type.use}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function SaveToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-primary" />
      {label}
    </label>
  )
}
