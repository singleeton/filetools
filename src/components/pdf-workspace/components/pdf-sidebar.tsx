'use client'

import {
  Scissors,
  FileOutput,
  Trash2,
  RotateCw,
  Copy,
  Repeat,
  ArrowUpDown,
  MousePointer2,
  Move,
  LayoutPanelTop,
  Bookmark,
  Tag,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { WorkspaceTool } from '../types'

export interface PdfSidebarLabels extends Record<WorkspaceTool, string> {
  futureTools: string
  comingSoon: string
}

interface PdfSidebarProps {
  activeTool: WorkspaceTool
  onToolChange: (tool: WorkspaceTool) => void
  labels: PdfSidebarLabels
}

const TOOLS: { id: WorkspaceTool; icon: typeof Scissors }[] = [
  { id: 'split', icon: Scissors },
  { id: 'extract', icon: FileOutput },
  { id: 'delete', icon: Trash2 },
  { id: 'rotate', icon: RotateCw },
  { id: 'duplicate', icon: Copy },
  { id: 'reverse', icon: Repeat },
  { id: 'sort', icon: ArrowUpDown },
  { id: 'select', icon: MousePointer2 },
  { id: 'move', icon: Move },
  { id: 'organize', icon: LayoutPanelTop },
  { id: 'bookmarks', icon: Bookmark },
  { id: 'pageLabels', icon: Tag },
]

export function PdfSidebar({ activeTool, onToolChange, labels }: PdfSidebarProps) {
  return (
    <nav className="flex w-14 shrink-0 flex-col items-center gap-1 overflow-y-auto border-r bg-background py-3">
      {TOOLS.map(({ id, icon: Icon }) => (
        <Tooltip key={id}>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-pressed={activeTool === id}
                onClick={() => onToolChange(id)}
                className={cn(
                  'size-10 rounded-lg',
                  activeTool === id && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary',
                )}
              >
                <Icon className="size-[18px]" />
              </Button>
            }
          />
          <TooltipContent side="right">{labels[id]}</TooltipContent>
        </Tooltip>
      ))}

      <div className="mx-2 my-1 h-px w-8 bg-border" />

      <Tooltip>
        <TooltipTrigger
          render={
            <Button variant="ghost" size="icon" disabled className="size-10 rounded-lg opacity-40">
              <Sparkles className="size-[18px]" />
            </Button>
          }
        />
        <TooltipContent side="right">
          {labels.futureTools} · {labels.comingSoon}
        </TooltipContent>
      </Tooltip>
    </nav>
  )
}
