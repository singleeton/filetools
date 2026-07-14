'use client'

import { Plus, Trash2, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PageLabelRange, PageLabelStyle, WorkingPage } from '../types'

export interface PdfPageLabelsPanelLabels {
  title: string
  empty: string
  addRange: string
  fromPage: string
  style: string
  prefix: string
  startAt: string
  delete: string
  styles: Record<PageLabelStyle, string>
}

interface PdfPageLabelsPanelProps {
  ranges: PageLabelRange[]
  onChange: (ranges: PageLabelRange[]) => void
  workingPages: WorkingPage[]
  selectedPosition: number | null
  labels: PdfPageLabelsPanelLabels
}

let uidCounter = 0
function nextId() {
  uidCounter += 1
  return `label-range-${uidCounter}`
}

const STYLES: PageLabelStyle[] = ['D', 'r', 'R', 'a', 'A']

export function PdfPageLabelsPanel({ ranges, onChange, workingPages, selectedPosition, labels }: PdfPageLabelsPanelProps) {
  const sorted = [...ranges].sort((a, b) => a.fromPosition - b.fromPosition)

  function addRange() {
    const fromPosition = selectedPosition ?? 0
    onChange([...ranges, { id: nextId(), fromPosition, style: 'D', prefix: '', start: 1 }])
  }

  function patch(id: string, update: Partial<PageLabelRange>) {
    onChange(ranges.map((r) => (r.id === id ? { ...r, ...update } : r)))
  }

  return (
    <div className="flex flex-col gap-3 border-b bg-background px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <Tag className="size-4" /> {labels.title}
        </div>
        <Button size="sm" onClick={addRange}>
          <Plus className="size-3.5" /> {labels.addRange}
        </Button>
      </div>

      {sorted.length === 0 ? (
        <p className="text-xs text-muted-foreground">{labels.empty}</p>
      ) : (
        <div className="max-h-48 space-y-2 overflow-y-auto">
          {sorted.map((range) => (
            <div key={range.id} className="flex flex-wrap items-center gap-1.5 rounded-md border bg-muted/20 p-1.5">
              <span className="text-xs text-muted-foreground">{labels.fromPage}</span>
              <input
                type="number"
                min={1}
                max={workingPages.length}
                value={range.fromPosition + 1}
                onChange={(e) =>
                  patch(range.id, {
                    fromPosition: Math.max(0, Math.min(workingPages.length - 1, (parseInt(e.target.value, 10) || 1) - 1)),
                  })
                }
                className="w-14 rounded border bg-background px-1.5 py-1 text-xs"
              />

              <span className="text-xs text-muted-foreground">{labels.style}</span>
              <select
                value={range.style}
                onChange={(e) => patch(range.id, { style: e.target.value as PageLabelStyle })}
                className="rounded border bg-background px-1.5 py-1 text-xs"
              >
                {STYLES.map((s) => (
                  <option key={s} value={s}>
                    {labels.styles[s]}
                  </option>
                ))}
              </select>

              <span className="text-xs text-muted-foreground">{labels.prefix}</span>
              <input
                value={range.prefix}
                onChange={(e) => patch(range.id, { prefix: e.target.value })}
                className="w-16 rounded border bg-background px-1.5 py-1 text-xs"
              />

              <span className="text-xs text-muted-foreground">{labels.startAt}</span>
              <input
                type="number"
                min={1}
                value={range.start}
                onChange={(e) => patch(range.id, { start: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                className="w-14 rounded border bg-background px-1.5 py-1 text-xs"
              />

              <button
                type="button"
                onClick={() => onChange(ranges.filter((r) => r.id !== range.id))}
                title={labels.delete}
                className="ml-auto rounded p-1 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
