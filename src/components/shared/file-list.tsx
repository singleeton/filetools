'use client'

import { File as FileIcon, X, AlertCircle, CheckCircle2, Loader2, GripVertical } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { formatFileSize } from '@/utils/file-validation'
import type { UploadedFile } from '@/types/tool'

interface FileListProps {
  files: UploadedFile[]
  onRemove: (id: string) => void
  sortable?: boolean
  onReorder?: (fromIndex: number, toIndex: number) => void
}

export function FileList({ files, onRemove, sortable = false, onReorder }: FileListProps) {
  if (files.length === 0) return null

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString())
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10)
    if (fromIndex !== toIndex && onReorder) {
      onReorder(fromIndex, toIndex)
    }
  }

  return (
    <div className="space-y-2">
      {files.map((file, index) => (
        <div
          key={file.id}
          draggable={sortable}
          onDragStart={sortable ? (e) => handleDragStart(e, index) : undefined}
          onDragOver={sortable ? handleDragOver : undefined}
          onDrop={sortable ? (e) => handleDrop(e, index) : undefined}
          className={cn(
            'flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors',
            file.status === 'error' && 'border-destructive/50 bg-destructive/5',
            file.status === 'done' && 'border-green-500/50 bg-green-500/5',
            sortable && 'cursor-grab active:cursor-grabbing',
          )}
        >
          {sortable && (
            <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}

          <StatusIcon status={file.status} />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </span>
              {file.error && (
                <span className="text-xs text-destructive">{file.error}</span>
              )}
            </div>
            {(file.status === 'uploading' || file.status === 'processing') && (
              <Progress value={file.progress} className="mt-2 h-1.5" />
            )}
          </div>

          <button
            onClick={() => onRemove(file.id)}
            className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

function StatusIcon({ status }: { status: UploadedFile['status'] }) {
  switch (status) {
    case 'error':
      return <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
    case 'done':
      return <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
    case 'uploading':
    case 'processing':
      return <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
    default:
      return <FileIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
  }
}
