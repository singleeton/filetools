'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { getPdfjs } from '../lib/pdfjs-client'
import type { PdfThumbnailInfo } from '../types'

export type PdfLoadErrorReason = 'password-protected' | 'corrupted' | 'empty' | 'invalid'

export interface PdfDocumentInfo {
  pageCount: number
  pdfVersion: string | null
  orientation: 'portrait' | 'landscape'
}

interface UsePdfDocumentReturn {
  status: 'idle' | 'loading' | 'ready' | 'error'
  error: PdfLoadErrorReason | null
  info: PdfDocumentInfo | null
  getThumbnail: (sourceIndex: number, maxWidth?: number) => Promise<PdfThumbnailInfo>
}

const DEFAULT_THUMBNAIL_WIDTH = 220

export function usePdfDocument(file: File | null): UsePdfDocumentReturn {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [error, setError] = useState<PdfLoadErrorReason | null>(null)
  const [info, setInfo] = useState<PdfDocumentInfo | null>(null)
  const docRef = useRef<PDFDocumentProxy | null>(null)
  const thumbnailCache = useRef<Map<number, Promise<PdfThumbnailInfo>>>(new Map())

  useEffect(() => {
    thumbnailCache.current = new Map()
    docRef.current = null
    setInfo(null)
    setError(null)

    if (!file) {
      setStatus('idle')
      return
    }

    let cancelled = false
    setStatus('loading')

    async function load(pdfFile: File) {
      try {
        const bytes = new Uint8Array(await pdfFile.arrayBuffer())

        const header = new TextDecoder('latin1').decode(bytes.slice(0, 1024))
        const versionMatch = header.match(/%PDF-(\d\.\d)/)
        if (!versionMatch) {
          if (!cancelled) {
            setStatus('error')
            setError('invalid')
          }
          return
        }

        const pdfjs = getPdfjs()
        const doc = await pdfjs.getDocument({ data: bytes }).promise

        if (cancelled) return

        if (doc.numPages === 0) {
          setStatus('error')
          setError('empty')
          return
        }

        const firstPage = await doc.getPage(1)
        const viewport = firstPage.getViewport({ scale: 1 })

        docRef.current = doc
        setInfo({
          pageCount: doc.numPages,
          pdfVersion: versionMatch[1],
          orientation: viewport.width >= viewport.height ? 'landscape' : 'portrait',
        })
        setStatus('ready')
      } catch (err) {
        if (cancelled) return
        setStatus('error')
        const name = err instanceof Error ? err.name : ''
        setError(name === 'PasswordException' ? 'password-protected' : 'corrupted')
      }
    }

    load(file)

    return () => {
      cancelled = true
    }
  }, [file])

  const getThumbnail = useCallback(
    (sourceIndex: number, maxWidth = DEFAULT_THUMBNAIL_WIDTH) => {
      const doc = docRef.current
      if (!doc) return Promise.reject(new Error('PDF not loaded'))

      const cached = thumbnailCache.current.get(sourceIndex)
      if (cached) return cached

      const promise = (async () => {
        const page = await doc.getPage(sourceIndex + 1)
        const baseViewport = page.getViewport({ scale: 1 })
        const scale = maxWidth / baseViewport.width
        const viewport = page.getViewport({ scale })

        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas not supported')

        await page.render({ canvasContext: ctx, viewport }).promise

        return {
          dataUrl: canvas.toDataURL('image/png'),
          width: viewport.width,
          height: viewport.height,
        }
      })()

      thumbnailCache.current.set(sourceIndex, promise)
      return promise
    },
    [],
  )

  return { status, error, info, getThumbnail }
}
