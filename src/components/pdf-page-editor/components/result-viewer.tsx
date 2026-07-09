'use client'

import { useEffect, useState } from 'react'
import { Download, Loader2, FileArchive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatFileSize } from '@/utils/file-validation'
import type { MultiFileResult } from '@/services/tool-executor'
import type { PdfThumbnailInfo, WorkingPage } from '../types'

export interface ResultViewerLabels {
  downloadAll: string
  pages: string
  eachFileDownload: string
}

interface ResultViewerProps {
  results: MultiFileResult[]
  groups: number[][]
  workingPages: WorkingPage[]
  getThumbnail: (sourceIndex: number) => Promise<PdfThumbnailInfo>
  labels: ResultViewerLabels
}

async function downloadViaBlob(url: string, fileName: string) {
  const blob = await fetch(url).then((r) => r.blob())
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = fileName
  a.click()
  URL.revokeObjectURL(objectUrl)
}

export function ResultViewer({ results, groups, workingPages, getThumbnail, labels }: ResultViewerProps) {
  const [zipping, setZipping] = useState(false)

  async function downloadAllAsZip() {
    setZipping(true)
    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      await Promise.all(
        results.map(async (r) => {
          const blob = await fetch(r.url).then((res) => res.blob())
          zip.file(r.fileName, blob)
        }),
      )
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      await downloadViaBlob(URL.createObjectURL(zipBlob), 'split-pages.zip')
    } finally {
      setZipping(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {results.map((result, i) => (
          <ResultCard
            key={`${result.fileName}-${i}`}
            result={result}
            firstSourceIndex={workingPages[groups[i]?.[0] ?? 0]?.sourceIndex ?? 0}
            getThumbnail={getThumbnail}
            labels={labels}
          />
        ))}
      </div>

      {results.length > 1 && (
        <div className="flex justify-center">
          <Button onClick={downloadAllAsZip} disabled={zipping}>
            {zipping ? <Loader2 className="size-4 animate-spin" /> : <FileArchive className="size-4" />}
            {labels.downloadAll}
          </Button>
        </div>
      )}
    </div>
  )
}

function ResultCard({
  result,
  firstSourceIndex,
  getThumbnail,
  labels,
}: {
  result: MultiFileResult
  firstSourceIndex: number
  getThumbnail: (sourceIndex: number) => Promise<PdfThumbnailInfo>
  labels: ResultViewerLabels
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getThumbnail(firstSourceIndex)
      .then((info) => {
        if (!cancelled) setDataUrl(info.dataUrl)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [firstSourceIndex, getThumbnail])

  return (
    <div className="flex w-40 flex-col gap-2 rounded-lg border bg-card p-3">
      <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded border bg-muted">
        {dataUrl && (
          <img src={dataUrl} alt={result.fileName} className="max-h-full max-w-full object-contain" />
        )}
      </div>
      <div className="truncate text-xs font-medium" title={result.fileName}>
        {result.fileName}
      </div>
      <div className="text-xs text-muted-foreground">
        {result.pageCount ?? '—'} {labels.pages} · {formatFileSize(result.size)}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => downloadViaBlob(result.url, result.fileName)}
      >
        <Download className="size-3.5" /> {labels.eachFileDownload}
      </Button>
    </div>
  )
}
