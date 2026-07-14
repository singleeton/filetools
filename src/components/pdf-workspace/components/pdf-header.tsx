'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { Undo2, Redo2, Search, ZoomIn, ZoomOut, LayoutGrid, Download, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Menu, MenuTrigger, MenuContent, MenuCheckItem, MenuSeparator } from '@/components/ui/menu'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { cn } from '@/lib/utils'
import { ZOOM_STEPS, FIT_MODES, isFitMode } from '../hooks/use-pdf-zoom'
import type { CardSize, ZoomValue } from '../types'

export interface PdfHeaderLabels {
  undo: string
  redo: string
  searchPlaceholder: string
  zoomFitWidth: string
  zoomFitHeight: string
  zoomFitScreen: string
  gridView: string
  cardSizes: Record<CardSize, string>
  download: string
}

interface PdfHeaderProps {
  toolName: string
  totalPages: number
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  onSearch: (pageNumber: number) => void
  zoom: ZoomValue
  onZoomChange: (zoom: ZoomValue) => void
  onZoomIn: () => void
  onZoomOut: () => void
  cardSize: CardSize
  onCardSizeChange: (size: CardSize) => void
  onDownload: () => void
  downloadDisabled?: boolean
  labels: PdfHeaderLabels
}

const CARD_SIZES: CardSize[] = ['small', 'medium', 'large', 'xlarge']

export function PdfHeader({
  toolName,
  totalPages,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSearch,
  zoom,
  onZoomChange,
  onZoomIn,
  onZoomOut,
  cardSize,
  onCardSizeChange,
  onDownload,
  downloadDisabled,
  labels,
}: PdfHeaderProps) {
  const [searchValue, setSearchValue] = useState('')

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault()
    const n = parseInt(searchValue, 10)
    if (!Number.isNaN(n) && n >= 1 && n <= totalPages) {
      onSearch(n)
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-3">
      <Link href="/" className="flex shrink-0 items-center gap-2 pr-2">
        <FileText className="size-5 text-primary" />
      </Link>
      <div className="mr-2 shrink-0 border-r pr-3 text-sm font-semibold">{toolName}</div>

      <IconButton label={labels.undo} onClick={onUndo} disabled={!canUndo}>
        <Undo2 className="size-4" />
      </IconButton>
      <IconButton label={labels.redo} onClick={onRedo} disabled={!canRedo}>
        <Redo2 className="size-4" />
      </IconButton>

      <div className="mx-2 hidden max-w-40 flex-1 sm:block">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            inputMode="numeric"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder={labels.searchPlaceholder}
            className="h-8 w-full rounded-md border bg-background pl-7 pr-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </form>
      </div>

      <div className="flex-1" />

      <IconButton label="Zoom out" onClick={onZoomOut}>
        <ZoomOut className="size-4" />
      </IconButton>

      <Menu>
        <MenuTrigger
          render={
            <Button variant="ghost" size="sm" className="w-16 tabular-nums">
              {isFitMode(zoom) ? '' : `${zoom}%`}
            </Button>
          }
        />
        <MenuContent align="center">
          {ZOOM_STEPS.map((step) => (
            <MenuCheckItem key={step} checked={zoom === step} onClick={() => onZoomChange(step)}>
              {step}%
            </MenuCheckItem>
          ))}
          <MenuSeparator />
          {FIT_MODES.map((mode) => (
            <MenuCheckItem key={mode} checked={zoom === mode} onClick={() => onZoomChange(mode)}>
              {mode === 'fitWidth' ? labels.zoomFitWidth : mode === 'fitHeight' ? labels.zoomFitHeight : labels.zoomFitScreen}
            </MenuCheckItem>
          ))}
        </MenuContent>
      </Menu>

      <IconButton label="Zoom in" onClick={onZoomIn}>
        <ZoomIn className="size-4" />
      </IconButton>

      <Menu>
        <MenuTrigger
          render={
            <Button variant="ghost" size="icon">
              <LayoutGrid className="size-4" />
            </Button>
          }
        />
        <MenuContent align="end">
          {CARD_SIZES.map((size) => (
            <MenuCheckItem key={size} checked={cardSize === size} onClick={() => onCardSizeChange(size)}>
              {labels.cardSizes[size]}
            </MenuCheckItem>
          ))}
        </MenuContent>
      </Menu>

      <div className="mx-1 h-6 w-px bg-border" />

      <ThemeToggle />
      <LanguageSwitcher />

      <Button size="sm" onClick={onDownload} disabled={downloadDisabled} className="ml-1">
        <Download className="size-4" />
        {labels.download}
      </Button>
    </header>
  )
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button variant="ghost" size="icon" onClick={onClick} disabled={disabled} className={cn(disabled && 'opacity-40')}>
            {children}
          </Button>
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
