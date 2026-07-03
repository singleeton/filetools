'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Download, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDictionary } from '@/lib/i18n/dictionary-context'
import { trackEvent } from '@/lib/analytics'
import { BackgroundRemovalService } from '@/lib/background-removal/service'

interface BgEditorProps {
  imageFile: File
  onReset: () => void
}

type Phase = 'processing' | 'result' | 'error'

export function BgEditor({ imageFile, onReset }: BgEditorProps) {
  const { dict } = useDictionary()
  const t = dict.removeBg

  const [phase, setPhase] = useState<Phase>('processing')
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState<'model' | 'inference'>('model')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showOriginal, setShowOriginal] = useState(false)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)

  const urlsRef = useRef<{ original: string | null; result: string | null }>({
    original: null,
    result: null,
  })

  const process = useCallback(async () => {
    setPhase('processing')
    setProgress(0)
    setStage('model')
    setErrorMsg(null)

    try {
      const nextOriginalUrl = URL.createObjectURL(imageFile)
      urlsRef.current.original = nextOriginalUrl
      setOriginalUrl(nextOriginalUrl)

      const result = await BackgroundRemovalService.removeBackground(imageFile, {
        onProgress: (p, s) => {
          setProgress(p)
          setStage(s)
        },
      })

      const nextResultUrl = URL.createObjectURL(result.blob)
      urlsRef.current.result = nextResultUrl
      setResultUrl(nextResultUrl)
      setPhase('result')
      trackEvent('conversion_complete', { tool: 'remove-bg' })
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error')
      setPhase('error')
    }
  }, [imageFile])

  useEffect(() => {
    process()
    return () => {
      if (urlsRef.current.original) URL.revokeObjectURL(urlsRef.current.original)
      if (urlsRef.current.result) URL.revokeObjectURL(urlsRef.current.result)
    }
  }, [process])

  const download = useCallback(() => {
    const url = resultUrl
    if (!url) return
    trackEvent('download_click', { fileName: 'removed-bg.png' })
    const a = document.createElement('a')
    a.href = url
    a.download = imageFile.name.replace(/\.[^.]+$/, '-nobg.png')
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [imageFile.name, resultUrl])

  if (phase === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <div className="space-y-2 text-center">
          <p className="font-medium">
            {stage === 'model' ? t.modelLoading : t.processing}
          </p>
          <div className="mx-auto h-2 w-64 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-200"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">{Math.round(progress * 100)}%</p>
        </div>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="font-medium text-destructive">{t.error}</p>
        {errorMsg && (
          <p className="max-w-md text-center text-sm text-muted-foreground">{errorMsg}</p>
        )}
        <div className="flex gap-3">
          <Button onClick={process}>{t.retry}</Button>
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            {t.removeAnother}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowOriginal(false)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            !showOriginal
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {t.after}
        </button>
        <button
          onClick={() => setShowOriginal(true)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            showOriginal
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {t.before}
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        {showOriginal ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={originalUrl!}
            alt="Original"
            className="block h-auto max-h-[70vh] w-full object-contain"
          />
        ) : (
          <div
            className="relative"
            style={{
              backgroundImage:
                'repeating-conic-gradient(#1a1a1a 0% 25%, #2d2d2d 0% 50%)',
              backgroundSize: '24px 24px',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resultUrl!}
              alt="Background removed"
              className="block h-auto max-h-[70vh] w-full object-contain"
            />
          </div>
        )}
      </div>

      <div className="flex justify-center gap-3">
        <Button size="lg" onClick={download}>
          <Download className="mr-2 h-4 w-4" />
          {t.download}
        </Button>
        <Button size="lg" variant="outline" onClick={onReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          {t.removeAnother}
        </Button>
      </div>
    </div>
  )
}
