'use client'

import { useCallback, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  ToolContainer,
  DropZone,
  ErrorAlert,
} from '@/components/shared'
import { useFileUpload } from '@/hooks/use-file-upload'
import { useDictionary } from '@/lib/i18n/dictionary-context'
import { toolConfigs } from '@/lib/tool-configs'
import {
  usePdfDocument,
  useWorkingPages,
  useSplitPlan,
  useSplitExecution,
  initWorkingPages,
  PdfSidebar,
  SplitToolbar,
  LiveSummary,
  PageGrid,
  FinalPreviewStep,
  ProcessingSteps,
  ResultViewer,
  type ZoomLevel,
} from '@/components/pdf-page-editor'

const config = toolConfigs['pdf-split']

type Step = 'editing' | 'preview'

export function PdfSplitClient() {
  const { dict } = useDictionary()
  const toolDict = dict.tool['pdf-split']
  const editorDict = dict.pageEditor

  const upload = useFileUpload({
    maxSizeBytes: config.maxFileSize,
    acceptedTypes: config.acceptedTypes,
    maxFiles: config.maxFiles,
  })

  const file = upload.validFiles[0]?.file ?? null
  const pdf = usePdfDocument(file)

  const initialPages = useMemo(
    () => (pdf.info ? initWorkingPages(pdf.info.pageCount) : []),
    [pdf.info?.pageCount, file],
  )
  const working = useWorkingPages(initialPages)
  const splitPlan = useSplitPlan(working.pages, working.selectedIds)
  const execution = useSplitExecution()

  const [step, setStep] = useState<Step>('editing')
  const [zoom, setZoom] = useState<ZoomLevel>('medium')

  const bytesPerPage = pdf.info && pdf.info.pageCount > 0 ? (file?.size ?? 0) / pdf.info.pageCount : 0
  const estimatedSizeBytes = splitPlan.groups.reduce((sum, group) => sum + group.length * bytesPerPage, 0)

  const handleReset = useCallback(() => {
    upload.clearFiles()
    execution.reset()
    setStep('editing')
    setZoom('medium')
  }, [upload, execution])

  const handleConfirmSplit = useCallback(() => {
    if (!file) return
    execution.executeSplit(file, working.pages, splitPlan.groups)
  }, [file, working.pages, splitPlan.groups, execution])

  // --- Result screen ---
  if (execution.state === 'done' && execution.results) {
    return (
      <ToolContainer toolId={config.id} title={toolDict.name} description={toolDict.description} href="/pdf-split">
        <div className="space-y-6">
          <ResultViewer
            results={execution.results}
            groups={splitPlan.groups}
            workingPages={working.pages}
            getThumbnail={pdf.getThumbnail}
            labels={editorDict.result}
          />
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleReset}>
              {toolDict.name}
            </Button>
          </div>
        </div>
      </ToolContainer>
    )
  }

  // --- Processing screen ---
  if (execution.state === 'processing') {
    return (
      <ToolContainer toolId={config.id} title={toolDict.name} description={toolDict.description} href="/pdf-split">
        <ProcessingSteps phase={execution.phase} labels={editorDict.processing} />
      </ToolContainer>
    )
  }

  return (
    <ToolContainer toolId={config.id} title={toolDict.name} description={toolDict.description} href="/pdf-split">
      <div className="space-y-6">
        {execution.error && <ErrorAlert message={execution.error} />}

        {!file && (
          <DropZone
            onFilesSelected={upload.addFiles}
            acceptedTypes={config.acceptedTypes}
            maxFileSize={config.maxFileSize}
            maxFiles={config.maxFiles}
          />
        )}

        {file && pdf.status === 'loading' && (
          <p className="py-12 text-center text-sm text-muted-foreground">{editorDict.loading}</p>
        )}

        {file && pdf.status === 'error' && pdf.error && (
          <div className="space-y-4">
            <ErrorAlert message={editorDict.errors[toErrorKey(pdf.error)]} />
            <div className="flex justify-center">
              <Button variant="outline" onClick={handleReset}>
                {toolDict.name}
              </Button>
            </div>
          </div>
        )}

        {file && pdf.status === 'ready' && pdf.info && step === 'editing' && (
          <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
            <div className="space-y-4">
              <PdfSidebar file={file} info={pdf.info} labels={editorDict.sidebar} />
              <LiveSummary
                selectedCount={working.selectedIds.size}
                outputCount={splitPlan.groups.length}
                estimatedSizeBytes={estimatedSizeBytes}
                labels={editorDict.summary}
              />
            </div>

            <div className="space-y-4">
              <SplitToolbar
                mode={splitPlan.mode}
                onModeChange={splitPlan.setMode}
                ranges={splitPlan.ranges}
                onRangesChange={splitPlan.setRanges}
                everyN={splitPlan.everyN}
                onEveryNChange={splitPlan.setEveryN}
                zoom={zoom}
                onZoomChange={setZoom}
                onSelectAll={working.selectAll}
                onDeselectAll={working.deselectAll}
                onInvertSelection={working.invertSelection}
                labels={editorDict.toolbar}
              />

              <PageGrid
                pages={working.pages}
                selectedIds={working.selectedIds}
                zoom={zoom}
                getThumbnail={pdf.getThumbnail}
                onReorder={working.reorder}
                onToggleSelect={working.toggleSelect}
                onRotate={(id) => working.rotate([id], 90)}
                onDelete={(id) => working.remove([id])}
                onDuplicate={working.duplicate}
                labels={editorDict.page}
                customSplitMode={splitPlan.mode === 'custom'}
                splitAfterPositions={splitPlan.splitAfterPositions}
                onToggleSplitAfter={splitPlan.toggleSplitAfter}
              />

              <p className="text-xs text-muted-foreground">
                {editorDict.shortcuts.deleteHint} · {editorDict.shortcuts.selectAllHint} ·{' '}
                {editorDict.shortcuts.undoHint}
              </p>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  disabled={splitPlan.groups.length === 0}
                  onClick={() => setStep('preview')}
                >
                  {editorDict.processButton}
                </Button>
              </div>
            </div>
          </div>
        )}

        {file && pdf.status === 'ready' && pdf.info && step === 'preview' && (
          <FinalPreviewStep
            workingPages={working.pages}
            groups={splitPlan.groups}
            originalPageCount={pdf.info.pageCount}
            getThumbnail={pdf.getThumbnail}
            onConfirm={handleConfirmSplit}
            onBack={() => setStep('editing')}
            labels={editorDict.preview}
          />
        )}
      </div>
    </ToolContainer>
  )
}

function toErrorKey(reason: 'password-protected' | 'corrupted' | 'empty' | 'invalid') {
  return reason === 'password-protected'
    ? ('passwordProtected' as const)
    : (reason as 'corrupted' | 'empty' | 'invalid')
}
