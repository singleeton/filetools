'use client'

import { useEffect, useState } from 'react'
import { Download, Loader2, FileArchive, Trash2, Pencil, Check, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatFileSize } from '@/utils/file-validation'
import type { MultiFileResult } from '@/services/tool-executor'
import type { PdfThumbnailInfo, WorkingPage } from '../types'

export interface PdfResultViewerLabels {
  before: string
  after: string
  originalPages: string
  downloadAll: string
  pages: string
  download: string
  delete: string
  rename: string
  outputFiles: string
}

interface PdfResultViewerProps {
  results: MultiFileResult[]
  groups: number[][]
  workingPages: WorkingPage[]
  originalFile: File
  originalPageCount: number
  getThumbnail: (sourceIndex: number) => Promise<PdfThumbnailInfo>
  labels: PdfResultViewerLabels
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

export function PdfResultViewer({
  results,
  groups,
  workingPages,
  originalFile,
  originalPageCount,
  getThumbnail,
  labels,
}: PdfResultViewerProps) {
  const [zipping, setZipping] = useState(false)
  const [removedIndices, setRemovedIndices] = useState<Set<number>>(new Set())
  const [names, setNames] = useState<string[]>(() => results.map((r) => r.fileName))

  const visible = results
    .map((result, i) => ({ result, i }))
    .filter(({ i }) => !removedIndices.has(i))

  async function downloadAllAsZip() {
    setZipping(true)
    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      await Promise.all(
        visible.map(async ({ result, i }) => {
          const blob = await fetch(result.url).then((res) => res.blob())
          zip.file(names[i], blob)
        }),
      )
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      await downloadViaBlob(URL.createObjectURL(zipBlob), 'pdf-workspace-export.zip')
    } finally {
      setZipping(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-xl border bg-card p-4 text-center">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{labels.before}</div>
          <div className="mx-auto flex h-28 w-20 items-center justify-center rounded-lg border bg-muted text-sm font-medium text-muted-foreground">
            {originalPageCount}p
          </div>
          <div className="mt-2 truncate text-xs text-muted-foreground" title={originalFile.name}>
            {originalFile.name}
          </div>
        </div>

        <ArrowRight className="mx-auto hidden size-6 text-muted-foreground sm:block" />

        <div className="rounded-xl border bg-card p-4 text-center">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{labels.after}</div>
          <div className="mx-auto flex h-28 w-20 items-center justify-center rounded-lg border bg-primary/10 text-lg font-semibold text-primary">
            {visible.length}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {visible.length} {labels.outputFiles}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {visible.map(({ result, i }) => (
          <ResultCard
            key={`${result.fileName}-${i}`}
            result={result}
            name={names[i]}
            onRename={(name) => setNames((prev) => prev.map((n, idx) => (idx === i ? name : n)))}
            onRemove={() => setRemovedIndices((prev) => new Set(prev).add(i))}
            firstSourceIndex={workingPages[groups[i]?.[0] ?? 0]?.sourceIndex ?? 0}
            fallbackPageCount={groups[i]?.length}
            getThumbnail={getThumbnail}
            labels={labels}
          />
        ))}
      </div>

      {visible.length > 1 && (
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
  name,
  onRename,
  onRemove,
  firstSourceIndex,
  fallbackPageCount,
  getThumbnail,
  labels,
}: {
  result: MultiFileResult
  name: string
  onRename: (name: string) => void
  onRemove: () => void
  firstSourceIndex: number
  fallbackPageCount?: number
  getThumbnail: (sourceIndex: number) => Promise<PdfThumbnailInfo>
  labels: PdfResultViewerLabels
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)

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

  function commitRename() {
    const trimmed = draft.trim()
    onRename(trimmed.length > 0 ? trimmed : name)
    setEditing(false)
  }

  return (
    <div className="flex w-40 flex-col gap-2 rounded-lg border bg-card p-3">
      <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded border bg-muted">
        {dataUrl && <img src={dataUrl} alt={name} className="max-h-full max-w-full object-contain" />}
      </div>

      {editing ? (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && commitRename()}
            onBlur={commitRename}
            className="w-full min-w-0 rounded border bg-background px-1.5 py-0.5 text-xs"
          />
          <button type="button" onClick={commitRename} className="shrink-0 text-primary">
            <Check className="size-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setDraft(name)
            setEditing(true)
          }}
          className="flex items-center gap-1 truncate text-left text-xs font-medium hover:text-primary"
          title={labels.rename}
        >
          <span className="truncate">{name}</span>
          <Pencil className="size-3 shrink-0 opacity-50" />
        </button>
      )}

      <div className="text-xs text-muted-foreground">
        {result.pageCount ?? fallbackPageCount ?? '—'} {labels.pages} · {formatFileSize(result.size)}
      </div>

      <div className="flex gap-1.5">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => downloadViaBlob(result.url, name)}>
          <Download className="size-3.5" /> {labels.download}
        </Button>
        <Button variant="outline" size="icon-sm" onClick={onRemove} title={labels.delete}>
          <Trash2 className="size-3.5 text-destructive" />
        </Button>
      </div>
    </div>
  )
}
