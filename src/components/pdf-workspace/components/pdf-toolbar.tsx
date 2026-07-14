'use client'

import { useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SplitMode, SplitRange, WorkspaceTool } from '../types'

export interface PdfToolbarLabels {
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
  rangesPlaceholder: string
  everyNLabel: string
  customHint: string
  hints: Partial<Record<WorkspaceTool, string>>
  primaryActions: {
    delete: string
    rotate: string
    duplicate: string
    reverse: string
    sort: string
    extract: string
    continueToPreview: string
  }
}

export interface PdfToolbarPrimaryAction {
  label: string
  onClick: () => void
  disabled?: boolean
}

interface PdfToolbarProps {
  activeTool: WorkspaceTool
  onSelectAll: () => void
  onDeselectAll: () => void
  onInvertSelection: () => void
  selectedCount: number
  // Split-mode specific state — only rendered when activeTool === 'split'.
  splitMode: SplitMode
  onSplitModeChange: (mode: SplitMode) => void
  ranges: SplitRange[]
  onRangesChange: (ranges: SplitRange[]) => void
  everyN: number
  onEveryNChange: (n: number) => void
  primaryAction: PdfToolbarPrimaryAction | null
  labels: PdfToolbarLabels
}

export function PdfToolbar({
  activeTool,
  onSelectAll,
  onDeselectAll,
  onInvertSelection,
  selectedCount,
  splitMode,
  onSplitModeChange,
  ranges,
  onRangesChange,
  everyN,
  onEveryNChange,
  primaryAction,
  labels,
}: PdfToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b bg-background px-4 py-2.5">
      {activeTool === 'split' && (
        <div className="flex flex-wrap items-center gap-2">
          {(['extract', 'everyPage', 'byRange', 'everyNPages', 'custom'] as SplitMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onSplitModeChange(mode)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                splitMode === mode
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background hover:bg-muted',
              )}
            >
              {labels.modes[mode]}
            </button>
          ))}

          {splitMode === 'byRange' && (
            <RangeEditor ranges={ranges} onChange={onRangesChange} placeholder={labels.rangesPlaceholder} />
          )}

          {splitMode === 'everyNPages' && (
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-muted-foreground">{labels.everyNLabel}</label>
              <input
                type="number"
                min={1}
                value={everyN}
                onChange={(e) => onEveryNChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-16 rounded-md border bg-background px-2 py-1 text-xs"
              />
            </div>
          )}

          {splitMode === 'custom' && <p className="text-xs text-muted-foreground">{labels.customHint}</p>}
        </div>
      )}

      {activeTool !== 'split' && labels.hints[activeTool] && (
        <p className="text-xs text-muted-foreground">{labels.hints[activeTool]}</p>
      )}

      <div className="mx-1 h-4 w-px bg-border" />

      <div className="flex items-center gap-3">
        {selectedCount > 0 && <span className="text-xs text-muted-foreground">{selectedCount}</span>}
        <TextButton onClick={onSelectAll}>{labels.selectAll}</TextButton>
        <TextButton onClick={onDeselectAll}>{labels.deselectAll}</TextButton>
        <TextButton onClick={onInvertSelection}>{labels.invertSelection}</TextButton>
      </div>

      <div className="flex-1" />

      {primaryAction && (
        <Button size="sm" onClick={primaryAction.onClick} disabled={primaryAction.disabled}>
          {primaryAction.label}
        </Button>
      )}
    </div>
  )
}

function TextButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="text-xs font-medium text-primary hover:underline">
      {children}
    </button>
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
      className="w-56 rounded-md border bg-background px-2 py-1 text-xs"
    />
  )
}
