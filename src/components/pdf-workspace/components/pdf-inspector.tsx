'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { RotateCcw, RotateCw, Trash2, Copy, FileOutput } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatFileSize } from '@/utils/file-validation'
import { guessPageSizeName } from '../lib/page-size'
import type { PdfDocumentInfo, PdfPageGeometry } from '../hooks/use-pdf-render-engine'
import type { PdfThumbnailInfo, WorkingPage } from '../types'

export interface PdfInspectorLabels {
  fileName: string
  fileSize: string
  totalPages: string
  pdfVersion: string
  orientation: string
  portrait: string
  landscape: string
  selectedPages: string
  pageNumber: string
  width: string
  height: string
  rotation: string
  pageSize: string
  pageLabel: string
  noSelection: string
  multipleSelected: string
  rotateLeft: string
  rotateRight: string
  duplicate: string
  delete: string
  extract: string
}

interface PdfInspectorProps {
  file: File
  info: PdfDocumentInfo
  selectedPages: WorkingPage[]
  totalPages: number
  getThumbnail: (sourceIndex: number) => Promise<PdfThumbnailInfo>
  getPageGeometry: (sourceIndex: number) => Promise<PdfPageGeometry>
  onRotateLeft: (ids: string[]) => void
  onRotateRight: (ids: string[]) => void
  onDelete: (ids: string[]) => void
  onDuplicate: (ids: string[]) => void
  onExtract: (ids: string[]) => void
  labels: PdfInspectorLabels
}

export function PdfInspector({
  file,
  info,
  selectedPages,
  totalPages,
  getThumbnail,
  getPageGeometry,
  onRotateLeft,
  onRotateRight,
  onDelete,
  onDuplicate,
  onExtract,
  labels,
}: PdfInspectorProps) {
  const single = selectedPages.length === 1 ? selectedPages[0] : null

  return (
    <aside className="flex w-72 shrink-0 flex-col gap-4 overflow-y-auto border-l bg-background p-4">
      {single ? (
        <SinglePageDetail
          page={single}
          getThumbnail={getThumbnail}
          getPageGeometry={getPageGeometry}
          labels={labels}
        />
      ) : (
        <div className="rounded-lg border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
          {selectedPages.length > 1 ? `${selectedPages.length} ${labels.multipleSelected}` : labels.noSelection}
        </div>
      )}

      {selectedPages.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          <ActionButton
            label={labels.rotateLeft}
            icon={<RotateCcw className="size-4" />}
            onClick={() => onRotateLeft(selectedPages.map((p) => p.id))}
          />
          <ActionButton
            label={labels.rotateRight}
            icon={<RotateCw className="size-4" />}
            onClick={() => onRotateRight(selectedPages.map((p) => p.id))}
          />
          <ActionButton
            label={labels.duplicate}
            icon={<Copy className="size-4" />}
            onClick={() => onDuplicate(selectedPages.map((p) => p.id))}
          />
          <ActionButton
            label={labels.extract}
            icon={<FileOutput className="size-4" />}
            onClick={() => onExtract(selectedPages.map((p) => p.id))}
          />
          <ActionButton
            label={labels.delete}
            icon={<Trash2 className="size-4" />}
            onClick={() => onDelete(selectedPages.map((p) => p.id))}
            destructive
            className="col-span-2"
          />
        </div>
      )}

      <div className="mt-auto space-y-2 border-t pt-4 text-sm">
        <Row label={labels.fileName} value={file.name} />
        <Row label={labels.fileSize} value={formatFileSize(file.size)} />
        <Row label={labels.totalPages} value={String(totalPages)} />
        <Row label={labels.pdfVersion} value={info.pdfVersion ? `PDF ${info.pdfVersion}` : '—'} />
        <Row label={labels.orientation} value={info.orientation === 'portrait' ? labels.portrait : labels.landscape} />
      </div>
    </aside>
  )
}

function SinglePageDetail({
  page,
  getThumbnail,
  getPageGeometry,
  labels,
}: {
  page: WorkingPage
  getThumbnail: (sourceIndex: number) => Promise<PdfThumbnailInfo>
  getPageGeometry: (sourceIndex: number) => Promise<PdfPageGeometry>
  labels: PdfInspectorLabels
}) {
  const [thumb, setThumb] = useState<PdfThumbnailInfo | null>(null)
  const [geometry, setGeometry] = useState<PdfPageGeometry | null>(null)

  useEffect(() => {
    let cancelled = false
    getThumbnail(page.sourceIndex).then((t) => !cancelled && setThumb(t))
    getPageGeometry(page.sourceIndex).then((g) => !cancelled && setGeometry(g))
    return () => {
      cancelled = true
    }
  }, [page.sourceIndex, getThumbnail, getPageGeometry])

  return (
    <div className="space-y-3">
      <div className="mx-auto flex aspect-[3/4] w-32 items-center justify-center overflow-hidden rounded-lg border bg-muted">
        {thumb && (
          <img
            src={thumb.dataUrl}
            alt=""
            style={{ transform: `rotate(${page.rotation}deg)` }}
            className="max-h-full max-w-full object-contain"
          />
        )}
      </div>
      <div className="space-y-2 text-sm">
        <Row label={labels.width} value={geometry ? `${geometry.width}pt` : '—'} />
        <Row label={labels.height} value={geometry ? `${geometry.height}pt` : '—'} />
        <Row label={labels.orientation} value={geometry ? (geometry.orientation === 'portrait' ? labels.portrait : labels.landscape) : '—'} />
        <Row label={labels.rotation} value={`${page.rotation}°`} />
        <Row label={labels.pageSize} value={geometry ? guessPageSizeName(geometry.width, geometry.height) : '—'} />
        {page.label && <Row label={labels.pageLabel} value={page.label} />}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium" title={value}>
        {value}
      </span>
    </div>
  )
}

function ActionButton({
  label,
  icon,
  onClick,
  destructive,
  className,
}: {
  label: string
  icon: ReactNode
  onClick: () => void
  destructive?: boolean
  className?: string
}) {
  return (
    <Button variant={destructive ? 'destructive' : 'outline'} size="sm" onClick={onClick} className={className}>
      {icon}
      {label}
    </Button>
  )
}
