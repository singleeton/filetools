'use client'

import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { ToolContainer } from './tool-container'
import { DropZone } from './drop-zone'
import { FileList } from './file-list'
import { DownloadSection } from './download-section'
import { ProcessingStatus } from './processing-status'
import { ErrorAlert } from './error-alert'
import { useFileUpload } from '@/hooks/use-file-upload'
import { useToolExecution } from '@/hooks/use-tool-execution'
import { useDictionary } from '@/lib/i18n/dictionary-context'
import type { ToolConfig } from '@/types/tool'

interface ToolPageProps {
  config: ToolConfig
  sortable?: boolean
  optionsPanel?: React.ReactNode
  getOptions?: () => Record<string, unknown>
}

export function ToolPage({
  config,
  sortable = false,
  optionsPanel,
  getOptions,
}: ToolPageProps) {
  const { dict } = useDictionary()
  const toolId = config.id as keyof typeof dict.tool
  const toolDict = dict.tool[toolId]

  const upload = useFileUpload({
    maxSizeBytes: config.maxFileSize,
    acceptedTypes: config.acceptedTypes,
    maxFiles: config.maxFiles,
  })

  const execution = useToolExecution()

  const handleProcess = useCallback(async () => {
    const filesToProcess = upload.validFiles.map((f) => f.file)
    if (filesToProcess.length === 0) return
    const options = getOptions?.()
    await execution.execute(config.id, filesToProcess, options)
  }, [upload.validFiles, execution, config.id, getOptions])

  const handleReset = useCallback(() => {
    upload.clearFiles()
    execution.reset()
  }, [upload, execution])

  if (execution.state === 'done' && execution.resultUrl && execution.resultFileName) {
    return (
      <ToolContainer toolId={config.id} title={toolDict.name} description={toolDict.description} href={`/${config.id}`}>
        <DownloadSection
          fileName={execution.resultFileName}
          fileUrl={execution.resultUrl}
          onReset={handleReset}
        />
      </ToolContainer>
    )
  }

  if (execution.state === 'processing') {
    return (
      <ToolContainer toolId={config.id} title={toolDict.name} description={toolDict.description} href={`/${config.id}`}>
        <ProcessingStatus progress={execution.progress} />
      </ToolContainer>
    )
  }

  const fileCount = upload.validFiles.length

  return (
    <ToolContainer toolId={config.id} title={toolDict.name} description={toolDict.description} href={`/${config.id}`}>
      <div className="space-y-6">
        {execution.error && <ErrorAlert message={execution.error} />}

        <DropZone
          onFilesSelected={upload.addFiles}
          acceptedTypes={config.acceptedTypes}
          maxFileSize={config.maxFileSize}
          maxFiles={config.maxFiles}
          multiple={config.allowMultiple}
        />

        <FileList
          files={upload.files}
          onRemove={upload.removeFile}
          sortable={sortable}
          onReorder={upload.reorderFiles}
        />

        {optionsPanel}

        {fileCount > 0 && (
          <div className="flex justify-center">
            <Button size="lg" onClick={handleProcess}>
              {dict.ui.process.button}{' '}
              {fileCount === 1
                ? `1 ${dict.ui.process.file}`
                : `${fileCount} ${dict.ui.process.files}`}
            </Button>
          </div>
        )}
      </div>
    </ToolContainer>
  )
}
