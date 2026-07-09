'use client'

import { RotateCw, Trash2, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PageActionLabels {
  rotate: string
  duplicate: string
  delete: string
}

interface PageActionsProps {
  onRotate: () => void
  onDuplicate: () => void
  onDelete: () => void
  labels: PageActionLabels
  className?: string
}

export function PageActions({ onRotate, onDuplicate, onDelete, labels, className }: PageActionsProps) {
  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      <button
        type="button"
        onClick={onRotate}
        aria-label={labels.rotate}
        title={labels.rotate}
        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <RotateCw className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={onDuplicate}
        aria-label={labels.duplicate}
        title={labels.duplicate}
        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Copy className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={labels.delete}
        title={labels.delete}
        className="rounded p-1 text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  )
}
