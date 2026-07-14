'use client'

import type { ReactNode } from 'react'
import { RotateCcw, RotateCw, Copy, Trash2, FileOutput, Repeat, ArrowUpDown, Move, Scissors, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Menu, MenuTrigger, MenuContent, MenuItem } from '@/components/ui/menu'
import { cn } from '@/lib/utils'

export interface PdfFloatingToolbarLabels {
  selected: string
  rotateLeft: string
  rotateRight: string
  duplicate: string
  extract: string
  delete: string
  reverse: string
  sort: string
  move: string
  moveToStart: string
  moveToEnd: string
  split: string
  splitAfter: string
  splitBefore: string
  close: string
}

interface PdfFloatingToolbarProps {
  count: number
  onRotateLeft: () => void
  onRotateRight: () => void
  onDuplicate: () => void
  onExtract: () => void
  onDelete: () => void
  onReverse: () => void
  onSort: () => void
  onMoveToStart: () => void
  onMoveToEnd: () => void
  onSplitAfter: () => void
  onSplitBefore: () => void
  onClose: () => void
  labels: PdfFloatingToolbarLabels
}

export function PdfFloatingToolbar({
  count,
  onRotateLeft,
  onRotateRight,
  onDuplicate,
  onExtract,
  onDelete,
  onReverse,
  onSort,
  onMoveToStart,
  onMoveToEnd,
  onSplitAfter,
  onSplitBefore,
  onClose,
  labels,
}: PdfFloatingToolbarProps) {
  if (count < 2) return null

  return (
    <div
      className={cn(
        'pointer-events-auto absolute left-1/2 top-3 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full border bg-popover/95 p-1.5 shadow-lg backdrop-blur-sm',
        'animate-in fade-in slide-in-from-top-2 duration-200',
      )}
    >
      <span className="px-2.5 text-xs font-medium text-muted-foreground">
        {labels.selected}: {count}
      </span>
      <div className="h-5 w-px bg-border" />

      <ToolbarIcon label={labels.rotateLeft} onClick={onRotateLeft}>
        <RotateCcw className="size-4" />
      </ToolbarIcon>
      <ToolbarIcon label={labels.rotateRight} onClick={onRotateRight}>
        <RotateCw className="size-4" />
      </ToolbarIcon>
      <ToolbarIcon label={labels.duplicate} onClick={onDuplicate}>
        <Copy className="size-4" />
      </ToolbarIcon>
      <ToolbarIcon label={labels.extract} onClick={onExtract}>
        <FileOutput className="size-4" />
      </ToolbarIcon>
      <ToolbarIcon label={labels.reverse} onClick={onReverse}>
        <Repeat className="size-4" />
      </ToolbarIcon>
      <ToolbarIcon label={labels.sort} onClick={onSort}>
        <ArrowUpDown className="size-4" />
      </ToolbarIcon>

      <Menu>
        <MenuTrigger
          render={
            <Button variant="ghost" size="icon" title={labels.move}>
              <Move className="size-4" />
            </Button>
          }
        />
        <MenuContent>
          <MenuItem onClick={onMoveToStart}>{labels.moveToStart}</MenuItem>
          <MenuItem onClick={onMoveToEnd}>{labels.moveToEnd}</MenuItem>
        </MenuContent>
      </Menu>

      <Menu>
        <MenuTrigger
          render={
            <Button variant="ghost" size="icon" title={labels.split}>
              <Scissors className="size-4" />
            </Button>
          }
        />
        <MenuContent>
          <MenuItem onClick={onSplitBefore}>{labels.splitBefore}</MenuItem>
          <MenuItem onClick={onSplitAfter}>{labels.splitAfter}</MenuItem>
        </MenuContent>
      </Menu>

      <div className="h-5 w-px bg-border" />
      <ToolbarIcon label={labels.delete} onClick={onDelete} destructive>
        <Trash2 className="size-4" />
      </ToolbarIcon>
      <ToolbarIcon label={labels.close} onClick={onClose}>
        <X className="size-4" />
      </ToolbarIcon>
    </div>
  )
}

function ToolbarIcon({
  label,
  onClick,
  destructive,
  children,
}: {
  label: string
  onClick: () => void
  destructive?: boolean
  children: ReactNode
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      title={label}
      onClick={onClick}
      className={cn(destructive && 'text-destructive hover:bg-destructive/10 hover:text-destructive')}
    >
      {children}
    </Button>
  )
}
