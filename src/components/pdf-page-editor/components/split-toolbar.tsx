'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { SplitMode, SplitRange } from '../types'
import type { ZoomLevel } from './pdf-thumbnail'

export interface SplitToolbarLabels {
  modes: {
    extract: string
    everyPage: string
    byRange: string
    everyNPages: string
    custom: string
  }
  selectAll: string
  deselectAll: string
  invertSelection: string
  zoomSmall: string
  zoomLarge: string
  rangesPlaceholder: string
  everyNLabel: string
  customHint: string
}

interface SplitToolbarProps {
  mode: SplitMode
  onModeChange: (mode: SplitMode) => void
  ranges: SplitRange[]
  onRangesChange: (ranges: SplitRange[]) => void
  everyN: number
  onEveryNChange: (n: number) => void
  zoom: ZoomLevel
  onZoomChange: (zoom: ZoomLevel) => void
  onSelectAll: () => void
  onDeselectAll: () => void
  onInvertSelection: () => void
  labels: SplitToolbarLabels
}

const ZOOM_LEVELS: ZoomLevel[] = ['small', 'medium', 'large']

export function SplitToolbar({
  mode,
  onModeChange,
  ranges,
  onRangesChange,
  everyN,
  onEveryNChange,
  zoom,
  onZoomChange,
  onSelectAll,
  onDeselectAll,
  onInvertSelection,
  labels,
}: SplitToolbarProps) {
  const modeOptions: { value: SplitMode; label: string }[] = [
    { value: 'extract', label: labels.modes.extract },
    { value: 'everyPage', label: labels.modes.everyPage },
    { value: 'byRange', label: labels.modes.byRange },
    { value: 'everyNPages', label: labels.modes.everyNPages },
    { value: 'custom', label: labels.modes.custom },
  ]

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex flex-wrap gap-2">
        {modeOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onModeChange(opt.value)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
              mode === opt.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background hover:bg-muted',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {mode === 'byRange' && (
        <RangeEditor ranges={ranges} onChange={onRangesChange} placeholder={labels.rangesPlaceholder} />
      )}

      {mode === 'everyNPages' && (
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">{labels.everyNLabel}</label>
          <input
            type="number"
            min={1}
            value={everyN}
            onChange={(e) => onEveryNChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-20 rounded-md border bg-background px-2 py-1 text-sm"
          />
        </div>
      )}

      {mode === 'custom' && <p className="text-sm text-muted-foreground">{labels.customHint}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
        <div className="flex gap-3">
          <button type="button" onClick={onSelectAll} className="text-sm text-primary hover:underline">
            {labels.selectAll}
          </button>
          <button type="button" onClick={onDeselectAll} className="text-sm text-primary hover:underline">
            {labels.deselectAll}
          </button>
          <button type="button" onClick={onInvertSelection} className="text-sm text-primary hover:underline">
            {labels.invertSelection}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{labels.zoomSmall}</span>
          <input
            type="range"
            min={0}
            max={2}
            step={1}
            value={ZOOM_LEVELS.indexOf(zoom)}
            onChange={(e) => onZoomChange(ZOOM_LEVELS[Number(e.target.value)])}
            className="w-24 accent-primary"
            aria-label="Zoom"
          />
          <span className="text-xs text-muted-foreground">{labels.zoomLarge}</span>
        </div>
      </div>
    </div>
  )
}

function RangeEditor({
  ranges,
  onChange,
  placeholder,
}: {
  ranges: SplitRange[]
  onChange: (ranges: SplitRange[]) => void
  placeholder: string
}) {
  const [text, setText] = useState(
    ranges.map((r) => (r.start === r.end ? `${r.start}` : `${r.start}-${r.end}`)).join(', '),
  )

  function commit(value: string) {
    const parsed = value
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part): SplitRange | null => {
        const match = part.match(/^(\d+)\s*-\s*(\d+)$/)
        if (match) return { start: parseInt(match[1], 10), end: parseInt(match[2], 10) }
        const n = parseInt(part, 10)
        return Number.isNaN(n) ? null : { start: n, end: n }
      })
      .filter((r): r is SplitRange => r !== null)
    onChange(parsed)
  }

  return (
    <input
      type="text"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={(e) => commit(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
    />
  )
}
