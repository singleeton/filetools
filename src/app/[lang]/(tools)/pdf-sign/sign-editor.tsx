'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Plus, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ErrorAlert } from '@/components/shared/error-alert'
import { ProcessingStatus } from '@/components/shared/processing-status'
import { DownloadSection } from '@/components/shared/download-section'
import { usePdfRenderEngine } from '@/components/pdf-workspace'
import { useToolExecution } from '@/hooks/use-tool-execution'
import { useDictionary } from '@/lib/i18n/dictionary-context'
import { cn } from '@/lib/utils'
import { SignaturePad } from './signature-pad'
import { SignatureOverlay, type SignatureRect } from './signature-overlay'

interface SignEditorProps {
  pdfFile: File
  onReset: () => void
}

interface Placement {
  id: string
  pageIndex: number
  rect: SignatureRect
}

interface ActiveSignature {
  dataUrl: string
  aspectRatio: number
}

const DEFAULT_WIDTH_PCT = 0.3

function defaultRect(aspectRatio: number, pageWidth: number, pageHeight: number): SignatureRect {
  const wPct = DEFAULT_WIDTH_PCT
  const hPct = (wPct * pageWidth) / aspectRatio / pageHeight
  return {
    xPct: Math.min(0.6, 1 - wPct),
    yPct: Math.min(0.72, 1 - hPct),
    wPct,
    hPct,
  }
}

export function SignEditor({ pdfFile, onReset }: SignEditorProps) {
  const { dict } = useDictionary()
  const t = dict.sign

  const render = usePdfRenderEngine(pdfFile)
  const execution = useToolExecution()

  const [pageIndex, setPageIndex] = useState(0)
  const [pageImage, setPageImage] = useState<{ dataUrl: string; width: number; height: number } | null>(null)
  const [signature, setSignature] = useState<ActiveSignature | null>(null)
  const [placements, setPlacements] = useState<Placement[]>([])
  const [placementError, setPlacementError] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (render.status !== 'ready') return
    let cancelled = false
    render.getThumbnail(pageIndex, 900).then((info) => {
      if (!cancelled) setPageImage(info)
    })
    return () => {
      cancelled = true
    }
  }, [render, pageIndex])

  const handleSignatureSelect = useCallback(
    (sig: ActiveSignature) => {
      setSignature(sig)
      setPlacementError(false)
      if (!pageImage) return
      const rect = defaultRect(sig.aspectRatio, pageImage.width, pageImage.height)
      setPlacements([{ id: crypto.randomUUID(), pageIndex, rect }])
    },
    [pageImage, pageIndex],
  )

  const addPlacementOnCurrentPage = useCallback(() => {
    if (!signature || !pageImage) return
    const rect = defaultRect(signature.aspectRatio, pageImage.width, pageImage.height)
    setPlacements((prev) => [...prev, { id: crypto.randomUUID(), pageIndex, rect }])
    setPlacementError(false)
  }, [signature, pageImage, pageIndex])

  const updatePlacementRect = useCallback((id: string, rect: SignatureRect) => {
    setPlacements((prev) => prev.map((p) => (p.id === id ? { ...p, rect } : p)))
  }, [])

  const removePlacement = useCallback((id: string) => {
    setPlacements((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const currentPagePlacements = useMemo(
    () => placements.filter((p) => p.pageIndex === pageIndex),
    [placements, pageIndex],
  )

  const handleDownload = useCallback(async () => {
    if (!signature || placements.length === 0) {
      setPlacementError(true)
      return
    }

    const pointPlacements = await Promise.all(
      placements.map(async (p) => {
        const geo = await render.getPageGeometry(p.pageIndex)
        const width = p.rect.wPct * geo.width
        const height = p.rect.hPct * geo.height
        const x = p.rect.xPct * geo.width
        const y = geo.height - p.rect.yPct * geo.height - height
        return { pageIndex: p.pageIndex, x, y, width, height }
      }),
    )

    await execution.execute('pdf-sign', [pdfFile], {
      signatureDataUrl: signature.dataUrl,
      placements: pointPlacements,
    })
  }, [signature, placements, render, execution, pdfFile])

  if (execution.state === 'done' && execution.resultUrl && execution.resultFileName) {
    return <DownloadSection fileName={execution.resultFileName} fileUrl={execution.resultUrl} onReset={onReset} />
  }

  if (execution.state === 'processing') {
    return <ProcessingStatus progress={execution.progress} message={t.processing} />
  }

  if (render.status === 'error' && render.error) {
    const errors = dict.pdfWorkspace.errors
    const message =
      render.error === 'password-protected'
        ? errors.passwordProtected
        : errors[render.error]
    return (
      <div className="space-y-4">
        <ErrorAlert message={message} />
        <div className="flex justify-center">
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            {t.reset}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {execution.error && <ErrorAlert message={execution.error} />}
      {placementError && <ErrorAlert message={signature ? t.errors.noPlacement : t.errors.noSignature} />}

      {render.info && render.info.pageCount > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: render.info.pageCount }).map((_, i) => (
            <PageThumb
              key={i}
              pageIndex={i}
              active={i === pageIndex}
              getThumbnail={render.getThumbnail}
              onClick={() => setPageIndex(i)}
            />
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border bg-card">
        <div ref={containerRef} className="relative">
          {pageImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pageImage.dataUrl} alt="" className="block h-auto w-full" draggable={false} />
          ) : (
            <div className="flex h-96 items-center justify-center text-sm text-muted-foreground">
              {dict.pdfWorkspace.loading}
            </div>
          )}

          {currentPagePlacements.map((p) => (
            <SignatureOverlay
              key={p.id}
              imageUrl={signature!.dataUrl}
              aspectRatio={signature!.aspectRatio}
              rect={p.rect}
              containerRef={containerRef}
              onChange={(rect) => updatePlacementRect(p.id, rect)}
              onRemove={() => removePlacement(p.id)}
              removeLabel={t.placement.remove}
            />
          ))}
        </div>
      </div>

      {render.info && render.info.pageCount > 1 && (
        <p className="text-center text-xs text-muted-foreground">
          {t.pageLabel.replace('{current}', String(pageIndex + 1)).replace('{total}', String(render.info.pageCount))}
        </p>
      )}

      {signature && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={addPlacementOnCurrentPage}>
            <Plus className="mr-1.5 h-4 w-4" />
            {t.placement.addAnother}
          </Button>
        </div>
      )}

      <SignaturePad onSelect={handleSignatureSelect} />

      <div className={cn('flex justify-center gap-3')}>
        <Button size="lg" onClick={handleDownload} disabled={!signature}>
          {t.download}
        </Button>
        <Button size="lg" variant="outline" onClick={onReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          {t.reset}
        </Button>
      </div>
    </div>
  )
}

function PageThumb({
  pageIndex,
  active,
  getThumbnail,
  onClick,
}: {
  pageIndex: number
  active: boolean
  getThumbnail: (index: number, maxWidth?: number) => Promise<{ dataUrl: string; width: number; height: number }>
  onClick: () => void
}) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getThumbnail(pageIndex, 120).then((info) => {
      if (!cancelled) setUrl(info.dataUrl)
    })
    return () => {
      cancelled = true
    }
  }, [pageIndex, getThumbnail])

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 overflow-hidden rounded-md border-2 bg-white',
        active ? 'border-primary' : 'border-transparent',
      )}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-20 w-auto" />
      ) : (
        <div className="h-20 w-14 animate-pulse bg-muted" />
      )}
    </button>
  )
}
