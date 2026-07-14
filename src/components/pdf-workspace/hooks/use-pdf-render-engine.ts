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

export interface PdfPageGeometry {
  width: number
  height: number
  orientation: 'portrait' | 'landscape'
}

interface UsePdfRenderEngineReturn {
  status: 'idle' | 'loading' | 'ready' | 'error'
  error: PdfLoadErrorReason | null
  info: PdfDocumentInfo | null
  getThumbnail: (sourceIndex: number, maxWidth?: number) => Promise<PdfThumbnailInfo>
  getPageGeometry: (sourceIndex: number) => Promise<PdfPageGeometry>
  getOutline: () => Promise<ImportedOutlineNode[]>
}

export interface ImportedOutlineNode {
  title: string
  destPageIndex: number | null
  items: ImportedOutlineNode[]
}

const DEFAULT_THUMBNAIL_WIDTH = 220
const THUMBNAIL_CACHE_LIMIT = 400
// Caps concurrent pdf.js page-render calls so 500+/1000+ page documents don't
// fire hundreds of simultaneous canvas renders at once (memory + jank).
const RENDER_CONCURRENCY = 4

class RenderQueue {
  private running = 0
  private queue: (() => void)[] = []

  async run<T>(task: () => Promise<T>): Promise<T> {
    if (this.running >= RENDER_CONCURRENCY) {
      await new Promise<void>((resolve) => this.queue.push(resolve))
    }
    this.running++
    try {
      return await task()
    } finally {
      this.running--
      const next = this.queue.shift()
      if (next) next()
    }
  }
}

export function usePdfRenderEngine(file: File | null): UsePdfRenderEngineReturn {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [error, setError] = useState<PdfLoadErrorReason | null>(null)
  const [info, setInfo] = useState<PdfDocumentInfo | null>(null)
  const docRef = useRef<PDFDocumentProxy | null>(null)
  // Insertion-ordered map used as a cheap LRU: re-inserting a key on access
  // moves it to the end, so eviction (from the front) drops the coldest entry.
  const thumbnailCache = useRef<Map<number, Promise<PdfThumbnailInfo>>>(new Map())
  const geometryCache = useRef<Map<number, Promise<PdfPageGeometry>>>(new Map())
  const queueRef = useRef(new RenderQueue())

  // Reset state during render (not in an Effect) whenever a new file comes
  // in. Refs (caches, the doc handle) aren't touched here — refs must only
  // be read/written outside of render, so their reset lives in the Effect
  // below alongside the async decode.
  const [prevFile, setPrevFile] = useState(file)
  if (file !== prevFile) {
    setPrevFile(file)
    setInfo(null)
    setError(null)
    setStatus(file ? 'loading' : 'idle')
  }

  useEffect(() => {
    thumbnailCache.current = new Map()
    geometryCache.current = new Map()
    queueRef.current = new RenderQueue()
    docRef.current = null

    if (!file) return

    let cancelled = false

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

  const getThumbnail = useCallback((sourceIndex: number, maxWidth = DEFAULT_THUMBNAIL_WIDTH) => {
    const doc = docRef.current
    if (!doc) return Promise.reject(new Error('PDF not loaded'))

    const cache = thumbnailCache.current
    const cached = cache.get(sourceIndex)
    if (cached) {
      // touch: move to the end so it's the most-recently-used entry
      cache.delete(sourceIndex)
      cache.set(sourceIndex, cached)
      return cached
    }

    const promise = queueRef.current.run(async () => {
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
    })

    cache.set(sourceIndex, promise)
    if (cache.size > THUMBNAIL_CACHE_LIMIT) {
      const oldestKey = cache.keys().next().value
      if (oldestKey !== undefined) cache.delete(oldestKey)
    }
    return promise
  }, [])

  const getPageGeometry = useCallback((sourceIndex: number) => {
    const doc = docRef.current
    if (!doc) return Promise.reject(new Error('PDF not loaded'))

    const cached = geometryCache.current.get(sourceIndex)
    if (cached) return cached

    const promise = (async () => {
      const page = await doc.getPage(sourceIndex + 1)
      const viewport = page.getViewport({ scale: 1 })
      return {
        width: Math.round(viewport.width),
        height: Math.round(viewport.height),
        orientation: (viewport.width >= viewport.height ? 'landscape' : 'portrait') as
          | 'portrait'
          | 'landscape',
      }
    })()

    geometryCache.current.set(sourceIndex, promise)
    return promise
  }, [])

  const getOutline = useCallback(async (): Promise<ImportedOutlineNode[]> => {
    const doc = docRef.current
    if (!doc) return []

    type RawOutlineItem = {
      title: string
      dest: string | unknown[] | null
      items: RawOutlineItem[]
    }

    async function resolveDestPageIndex(dest: RawOutlineItem['dest']): Promise<number | null> {
      try {
        const explicitDest = typeof dest === 'string' ? await doc!.getDestination(dest) : dest
        if (!explicitDest || !Array.isArray(explicitDest)) return null
        const ref = explicitDest[0]
        return await doc!.getPageIndex(ref)
      } catch {
        return null
      }
    }

    async function mapNode(node: RawOutlineItem): Promise<ImportedOutlineNode> {
      const destPageIndex = await resolveDestPageIndex(node.dest)
      const items = await Promise.all(node.items.map(mapNode))
      return { title: node.title, destPageIndex, items }
    }

    try {
      const raw = (await doc.getOutline()) as RawOutlineItem[] | null
      if (!raw) return []
      return Promise.all(raw.map(mapNode))
    } catch {
      return []
    }
  }, [])

  return { status, error, info, getThumbnail, getPageGeometry, getOutline }
}
