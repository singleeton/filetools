'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  ToolContainer,
  DropZone,
  FileList,
  DownloadSection,
  ProcessingStatus,
  ErrorAlert,
} from '@/components/shared'
import { useFileUpload } from '@/hooks/use-file-upload'
import { useToolExecution } from '@/hooks/use-tool-execution'
import { useDictionary } from '@/lib/i18n/dictionary-context'
import { toolConfigs } from '@/lib/tool-configs'
import { SplitOptions, type SplitMode } from './split-options'

const config = toolConfigs['pdf-split']

export function PdfSplitClient() {
  const { dict } = useDictionary()
  const toolDict = dict.tool['pdf-split']

  const upload = useFileUpload({
    maxSizeBytes: config.maxFileSize,
    acceptedTypes: config.acceptedTypes,
    maxFiles: config.maxFiles,
  })

  const execution = useToolExecution()

  const [mode, setMode] = useState<SplitMode>('range')
  const [rangeStart, setRangeStart] = useState('1')
  const [rangeEnd, setRangeEnd] = useState('')
  const [extractPages, setExtractPages] = useState('')
  const [pageCount, setPageCount] = useState<number | null>(null)

  useEffect(() => {
    const file = upload.validFiles[0]
    if (!file) { setPageCount(null); return }
    const reader = new FileReader()
    reader.onload = () => {
      const text = new TextDecoder('latin1').decode(reader.result as ArrayBuffer)
      const match = text.match(/\/Count\s+(\d+)/)
      if (match) {
        const count = parseInt(match[1], 10)
        setPageCount(count)
        setRangeEnd(String(count))
      }
    }
    reader.readAsArrayBuffer(file.file.slice(0, 100_000))
  }, [upload.validFiles])

  const getOptions = useCallback(() => {
    if (mode === 'extract') {
      const pages = extractPages.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n))
      return { mode, pages }
    }
    if (mode === 'range') {
      return { mode, rangeStart: parseInt(rangeStart, 10) || 1, rangeEnd: parseInt(rangeEnd, 10) || pageCount || 1 }
    }
    return { mode }
  }, [mode, rangeStart, rangeEnd, extractPages, pageCount])

  const handleProcess = useCallback(async () => {
    const filesToProcess = upload.validFiles.map((f) => f.file)
    if (filesToProcess.length === 0) return
    await execution.execute(config.id, filesToProcess, getOptions())
  }, [upload.validFiles, execution, getOptions])

  const handleReset = useCallback(() => {
    upload.clearFiles()
    execution.reset()
    setMode('range')
    setRangeStart('1')
    setRangeEnd('')
    setExtractPages('')
    setPageCount(null)
  }, [upload, execution])

  if (execution.state === 'done' && execution.resultUrl && execution.resultFileName) {
    return (
      <ToolContainer toolId={config.id} title={toolDict.name} description={toolDict.description} href="/pdf-split">
        <DownloadSection fileName={execution.resultFileName} fileUrl={execution.resultUrl} onReset={handleReset} />
      </ToolContainer>
    )
  }

  if (execution.state === 'processing') {
    return (
      <ToolContainer toolId={config.id} title={toolDict.name} description={toolDict.description} href="/pdf-split">
        <ProcessingStatus progress={execution.progress} />
      </ToolContainer>
    )
  }

  return (
    <ToolContainer toolId={config.id} title={toolDict.name} description={toolDict.description} href="/pdf-split">
      <div className="space-y-6">
        {execution.error && <ErrorAlert message={execution.error} />}
        <DropZone onFilesSelected={upload.addFiles} acceptedTypes={config.acceptedTypes} maxFileSize={config.maxFileSize} maxFiles={config.maxFiles} />
        <FileList files={upload.files} onRemove={upload.removeFile} />
        {upload.validFiles.length > 0 && (
          <>
            <SplitOptions
              mode={mode} onModeChange={setMode}
              rangeStart={rangeStart} onRangeStartChange={setRangeStart}
              rangeEnd={rangeEnd} onRangeEndChange={setRangeEnd}
              extractPages={extractPages} onExtractPagesChange={setExtractPages}
              pageCount={pageCount}
            />
            <div className="flex justify-center">
              <Button size="lg" onClick={handleProcess}>{dict.split.button}</Button>
            </div>
          </>
        )}
      </div>
    </ToolContainer>
  )
}
