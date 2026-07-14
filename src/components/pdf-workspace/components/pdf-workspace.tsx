'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ErrorAlert } from '@/components/shared'
import { PdfHeader, type PdfHeaderLabels } from './pdf-header'
import { PdfSidebar, type PdfSidebarLabels } from './pdf-sidebar'
import { PdfToolbar, type PdfToolbarLabels, type PdfToolbarPrimaryAction } from './pdf-toolbar'
import { PdfCanvas } from './pdf-canvas'
import { PdfGrid } from './pdf-grid'
import { type PdfThumbnailLabels } from './pdf-thumbnail'
import { PdfInspector, type PdfInspectorLabels } from './pdf-inspector'
import { PdfStatusBar, type PdfStatusBarLabels } from './pdf-status-bar'
import { PdfFloatingToolbar, type PdfFloatingToolbarLabels } from './pdf-floating-toolbar'
import { PdfProcessingSteps, type PdfProcessingStepsLabels } from './pdf-processing-steps'
import { PdfResultViewer, type PdfResultViewerLabels } from './pdf-result-viewer'
import { PdfPagePreviewOverlay } from './pdf-page-preview-overlay'
import { FinalPreviewStep, type FinalPreviewLabels } from './final-preview-step'
import { PdfBookmarksPanel, type PdfBookmarksPanelLabels } from './pdf-bookmarks-panel'
import { PdfPageLabelsPanel, type PdfPageLabelsPanelLabels } from './pdf-page-labels-panel'
import { PdfLiveSummary, type PdfLiveSummaryLabels } from './pdf-live-summary'
import { usePdfRenderEngine, type PdfLoadErrorReason } from '../hooks/use-pdf-render-engine'
import { usePdfHistoryManager, initWorkingPages } from '../hooks/use-pdf-history-manager'
import { usePdfSelection } from '../hooks/use-pdf-selection'
import { usePdfZoom } from '../hooks/use-pdf-zoom'
import { usePdfShortcuts } from '../hooks/use-pdf-shortcuts'
import { useSplitEngine } from '../hooks/use-split-engine'
import { useWorkspaceExecution } from '../hooks/use-workspace-execution'
import { deriveGroups, wholeDocumentGroup } from '../lib/split-plan'
import type { CardSize, OutlineNode, PageLabelRange, WorkspaceTool } from '../types'

const CARD_SIZE_ZOOM: Record<CardSize, 25 | 50 | 75 | 100 | 125 | 150 | 200> = {
  small: 50,
  medium: 100,
  large: 150,
  xlarge: 200,
}

function nearestCardSize(zoom: number): CardSize {
  let closest: CardSize = 'medium'
  let bestDiff = Infinity
  for (const [size, pct] of Object.entries(CARD_SIZE_ZOOM) as [CardSize, number][]) {
    const diff = Math.abs(pct - zoom)
    if (diff < bestDiff) {
      bestDiff = diff
      closest = size
    }
  }
  return closest
}

export interface PdfWorkspaceLabels {
  loading: string
  resetButton: string
  errors: Record<PdfLoadErrorReason, string>
  header: PdfHeaderLabels
  sidebar: PdfSidebarLabels
  toolbar: PdfToolbarLabels
  thumbnail: PdfThumbnailLabels
  inspector: PdfInspectorLabels
  statusBar: PdfStatusBarLabels
  floatingToolbar: PdfFloatingToolbarLabels
  liveSummary: Omit<PdfLiveSummaryLabels, 'modeNames'>
  processing: PdfProcessingStepsLabels
  result: PdfResultViewerLabels
  finalPreview: FinalPreviewLabels
  bookmarks: PdfBookmarksPanelLabels
  pageLabelsPanel: PdfPageLabelsPanelLabels
  toolName: string
}

interface PdfWorkspaceProps {
  file: File
  exportSlug: string
  outputBaseName?: string
  defaultTool: WorkspaceTool
  onReset: () => void
  labels: PdfWorkspaceLabels
}

export function PdfWorkspace({ file, exportSlug, outputBaseName, defaultTool, onReset, labels }: PdfWorkspaceProps) {
  const render = usePdfRenderEngine(file)
  const initialPages = useMemo(() => (render.info ? initWorkingPages(render.info.pageCount) : []), [render.info])

  const history = usePdfHistoryManager(initialPages)
  const selection = usePdfSelection(history.pages)
  const zoom = usePdfZoom(100)
  const splitEngine = useSplitEngine(history.pages, selection.selectedIds)
  const execution = useWorkspaceExecution()
  const canvasScrollRef = useRef<HTMLDivElement>(null)

  const [activeTool, setActiveTool] = useState<WorkspaceTool>(defaultTool)
  const [step, setStep] = useState<'editing' | 'preview'>('editing')
  const [previewPageId, setPreviewPageId] = useState<string | null>(null)
  const [scrollToPosition, setScrollToPosition] = useState<number | null>(null)
  const [outline, setOutline] = useState<OutlineNode[]>([])
  const [pageLabelRanges, setPageLabelRanges] = useState<PageLabelRange[]>([])
  const [importedOutline, setImportedOutline] = useState<Awaited<ReturnType<typeof render.getOutline>>>([])

  useEffect(() => {
    if (render.status === 'ready') {
      render.getOutline().then(setImportedOutline)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [render.status, file])

  const selectedPages = useMemo(
    () => history.pages.filter((p) => selection.selectedIds.has(p.id)),
    [history.pages, selection.selectedIds],
  )
  const selectedPositions = useMemo(
    () => history.pages.map((p, i) => (selection.selectedIds.has(p.id) ? i : -1)).filter((i) => i >= 0),
    [history.pages, selection.selectedIds],
  )
  const singleSelectedPosition = selectedPositions.length === 1 ? selectedPositions[0] : null

  const exportGroups = useMemo(() => {
    if (activeTool === 'split') return splitEngine.groups
    if (activeTool === 'extract') {
      return deriveGroups(history.pages, { mode: 'extract', selectedIds: Array.from(selection.selectedIds) })
    }
    return wholeDocumentGroup(history.pages)
  }, [activeTool, splitEngine.groups, history.pages, selection.selectedIds])

  const bytesPerPage = render.info && render.info.pageCount > 0 ? file.size / render.info.pageCount : 0
  const estimatedSizeBytes = exportGroups.reduce((sum, group) => sum + group.length * bytesPerPage, 0)

  const handleExport = useCallback(() => {
    if (exportGroups.length === 0) return
    execution.executeExport(exportSlug, file, history.pages, exportGroups, { outputBaseName, outline, pageLabels: pageLabelRanges })
  }, [exportGroups, execution, exportSlug, file, history.pages, outputBaseName, outline, pageLabelRanges])

  const handleReset = useCallback(() => {
    execution.reset()
    setStep('editing')
    onReset()
  }, [execution, onReset])

  const handlePreview = useCallback((id: string) => setPreviewPageId(id), [])

  const handleExtractIds = useCallback(
    (ids: string[]) => {
      selection.setSelectedIds(new Set(ids))
      setActiveTool('extract')
    },
    [selection],
  )

  usePdfShortcuts(
    {
      onSelectAll: selection.selectAll,
      onUndo: history.undo,
      onRedo: history.redo,
      onDelete: () => selection.selectedIds.size > 0 && history.remove(Array.from(selection.selectedIds)),
      onSpace: () => singleSelectedPosition !== null && setPreviewPageId(selectedPages[0]?.id ?? null),
      onEscape: () => (previewPageId ? setPreviewPageId(null) : selection.deselectAll()),
    },
    render.status === 'ready' && execution.state === 'idle',
  )

  const primaryAction: PdfToolbarPrimaryAction | null = useMemo(() => {
    const ids = Array.from(selection.selectedIds)
    switch (activeTool) {
      case 'split':
      case 'extract':
        return {
          label: labels.toolbar.primaryActions.continueToPreview,
          onClick: () => setStep('preview'),
          disabled: exportGroups.length === 0,
        }
      case 'delete':
        return { label: labels.toolbar.primaryActions.delete, onClick: () => history.remove(ids), disabled: ids.length === 0 }
      case 'rotate':
        return {
          label: labels.toolbar.primaryActions.rotate,
          onClick: () => history.rotate(ids, 90),
          disabled: ids.length === 0,
        }
      case 'duplicate':
        return {
          label: labels.toolbar.primaryActions.duplicate,
          onClick: () => history.duplicate(ids),
          disabled: ids.length === 0,
        }
      case 'reverse':
        return { label: labels.toolbar.primaryActions.reverse, onClick: () => history.reverseOrder() }
      case 'sort':
        return { label: labels.toolbar.primaryActions.sort, onClick: () => history.sortByOriginal() }
      default:
        return null
    }
  }, [activeTool, selection.selectedIds, exportGroups.length, history, labels.toolbar.primaryActions])

  if (render.status === 'loading' || render.status === 'idle') {
    return (
      <div className="flex h-[80vh] min-h-[500px] w-full items-center justify-center rounded-xl border bg-card">
        <p className="text-sm text-muted-foreground">{labels.loading}</p>
      </div>
    )
  }

  if (render.status === 'error' && render.error) {
    return (
      <div className="space-y-4 rounded-xl border bg-card p-8">
        <ErrorAlert message={labels.errors[render.error]} />
        <div className="flex justify-center">
          <Button variant="outline" onClick={handleReset}>
            {labels.resetButton}
          </Button>
        </div>
      </div>
    )
  }

  if (!render.info) return null

  if (execution.state === 'processing') {
    return (
      <div className="flex h-[80vh] min-h-[500px] w-full items-center justify-center rounded-xl border bg-card">
        <PdfProcessingSteps phase={execution.phase} labels={labels.processing} />
      </div>
    )
  }

  if (execution.state === 'done' && execution.results) {
    return (
      <div className="w-full space-y-6 rounded-xl border bg-card p-6">
        <PdfResultViewer
          results={execution.results}
          groups={exportGroups}
          workingPages={history.pages}
          originalFile={file}
          originalPageCount={render.info.pageCount}
          getThumbnail={render.getThumbnail}
          labels={labels.result}
        />
        <div className="flex justify-center">
          <Button variant="outline" onClick={handleReset}>
            {labels.resetButton}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[85vh] min-h-[640px] w-full flex-col overflow-hidden rounded-xl border bg-background shadow-sm">
      <PdfHeader
        toolName={labels.toolName}
        totalPages={history.pages.length}
        onUndo={history.undo}
        onRedo={history.redo}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        onSearch={(n) => setScrollToPosition(n - 1)}
        zoom={zoom.zoom}
        onZoomChange={zoom.setZoom}
        onZoomIn={zoom.zoomIn}
        onZoomOut={zoom.zoomOut}
        cardSize={nearestCardSize(zoom.isFit ? 100 : (zoom.zoom as number))}
        onCardSizeChange={(size) => zoom.setZoom(CARD_SIZE_ZOOM[size])}
        onDownload={handleExport}
        downloadDisabled={exportGroups.length === 0}
        labels={labels.header}
      />

      {activeTool === 'bookmarks' ? (
        <PdfBookmarksPanel
          outline={outline}
          onChange={setOutline}
          workingPages={history.pages}
          selectedPosition={singleSelectedPosition}
          importedOutline={importedOutline}
          labels={labels.bookmarks}
        />
      ) : activeTool === 'pageLabels' ? (
        <PdfPageLabelsPanel
          ranges={pageLabelRanges}
          onChange={setPageLabelRanges}
          workingPages={history.pages}
          selectedPosition={singleSelectedPosition}
          labels={labels.pageLabelsPanel}
        />
      ) : (
        <PdfToolbar
          activeTool={activeTool}
          onSelectAll={selection.selectAll}
          onDeselectAll={selection.deselectAll}
          onInvertSelection={selection.invertSelection}
          selectedCount={selection.selectedIds.size}
          splitMode={splitEngine.mode}
          onSplitModeChange={splitEngine.setMode}
          ranges={splitEngine.ranges}
          onRangesChange={splitEngine.setRanges}
          everyN={splitEngine.everyN}
          onEveryNChange={splitEngine.setEveryN}
          primaryAction={primaryAction}
          labels={labels.toolbar}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        <PdfSidebar activeTool={activeTool} onToolChange={setActiveTool} labels={labels.sidebar} />

        <div className="relative flex min-w-0 flex-1">
          <PdfCanvas
            scrollRef={canvasScrollRef}
            onContainerResize={zoom.reportContainerSize}
            topBar={
              step === 'editing' && selection.selectedIds.size >= 2 && (
              <PdfFloatingToolbar
                count={selection.selectedIds.size}
                onRotateLeft={() => history.rotate(Array.from(selection.selectedIds), 270)}
                onRotateRight={() => history.rotate(Array.from(selection.selectedIds), 90)}
                onDuplicate={() => history.duplicate(Array.from(selection.selectedIds))}
                onExtract={() => handleExtractIds(Array.from(selection.selectedIds))}
                onDelete={() => history.remove(Array.from(selection.selectedIds))}
                onReverse={() => history.reverseOrder()}
                onSort={() => history.sortByOriginal()}
                onMoveToStart={() => history.moveSelection(Array.from(selection.selectedIds), 0)}
                onMoveToEnd={() => history.moveSelection(Array.from(selection.selectedIds), history.pages.length)}
                onSplitAfter={() =>
                  selectedPositions.length > 0 && splitEngine.splitAfterSelectedPage(Math.max(...selectedPositions))
                }
                onSplitBefore={() =>
                  selectedPositions.length > 0 && splitEngine.splitBeforeSelectedPage(Math.min(...selectedPositions))
                }
                onClose={selection.deselectAll}
                labels={labels.floatingToolbar}
              />
              )
            }
          >
            {step === 'editing' ? (
              <PdfGrid
                pages={history.pages}
                selectedIds={selection.selectedIds}
                cardWidthPx={zoom.cardWidthPx}
                scrollContainerRef={canvasScrollRef}
                getThumbnail={render.getThumbnail}
                onReorder={history.reorder}
                onSelect={selection.select}
                onRotateLeft={(id) => history.rotate([id], 270)}
                onRotateRight={(id) => history.rotate([id], 90)}
                onDelete={(id) => history.remove([id])}
                onDuplicate={(id) => history.duplicate([id])}
                onPreview={handlePreview}
                onExtract={(id) => handleExtractIds([id])}
                onSplitAfter={splitEngine.splitAfterSelectedPage}
                onSplitBefore={splitEngine.splitBeforeSelectedPage}
                labels={labels.thumbnail}
                customSplitMode={activeTool === 'split' && splitEngine.mode === 'custom'}
                splitAfterPositions={splitEngine.splitAfterPositions}
                onToggleSplitAfter={splitEngine.toggleSplitAfter}
                scrollToPosition={scrollToPosition}
                onScrolledToPosition={() => setScrollToPosition(null)}
              />
            ) : (
              <FinalPreviewStep
                workingPages={history.pages}
                groups={exportGroups}
                originalPageCount={render.info.pageCount}
                getThumbnail={render.getThumbnail}
                onConfirm={handleExport}
                onBack={() => setStep('editing')}
                labels={labels.finalPreview}
              />
            )}
          </PdfCanvas>

          {step === 'editing' && (
            <div className="pointer-events-auto absolute right-3 bottom-3 w-56">
              <PdfLiveSummary
                selectedCount={selection.selectedIds.size}
                outputCount={exportGroups.length}
                estimatedSizeBytes={estimatedSizeBytes}
                activeTool={activeTool}
                labels={{ ...labels.liveSummary, modeNames: labels.sidebar }}
              />
            </div>
          )}
        </div>

        <PdfInspector
          file={file}
          info={render.info}
          selectedPages={selectedPages}
          totalPages={history.pages.length}
          getThumbnail={render.getThumbnail}
          getPageGeometry={render.getPageGeometry}
          onRotateLeft={(ids) => history.rotate(ids, 270)}
          onRotateRight={(ids) => history.rotate(ids, 90)}
          onDelete={history.remove}
          onDuplicate={history.duplicate}
          onExtract={handleExtractIds}
          labels={labels.inspector}
        />
      </div>

      <PdfStatusBar
        totalPages={history.pages.length}
        selectedCount={selection.selectedIds.size}
        zoom={zoom.zoom}
        labels={labels.statusBar}
      />

      {previewPageId &&
        (() => {
          const position = history.pages.findIndex((p) => p.id === previewPageId)
          const page = history.pages[position]
          if (!page) return null
          return (
            <PdfPagePreviewOverlay
              page={page}
              position={position}
              getThumbnail={render.getThumbnail}
              onClose={() => setPreviewPageId(null)}
              pageLabel={labels.thumbnail.page}
            />
          )
        })()}
    </div>
  )
}
