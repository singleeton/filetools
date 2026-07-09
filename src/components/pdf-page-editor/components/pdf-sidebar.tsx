'use client'

import { formatFileSize } from '@/utils/file-validation'
import type { PdfDocumentInfo } from '../hooks/use-pdf-document'

export interface PdfSidebarLabels {
  fileName: string
  fileSize: string
  totalPages: string
  pdfVersion: string
  orientation: string
  portrait: string
  landscape: string
}

interface PdfSidebarProps {
  file: File
  info: PdfDocumentInfo
  labels: PdfSidebarLabels
}

export function PdfSidebar({ file, info, labels }: PdfSidebarProps) {
  const rows: [string, string][] = [
    [labels.fileName, file.name],
    [labels.fileSize, formatFileSize(file.size)],
    [labels.totalPages, String(info.pageCount)],
    [labels.pdfVersion, info.pdfVersion ? `PDF ${info.pdfVersion}` : '—'],
    [labels.orientation, info.orientation === 'portrait' ? labels.portrait : labels.landscape],
  ]

  return (
    <div className="rounded-lg border bg-card p-4">
      <dl className="space-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="truncate font-medium" title={value}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
