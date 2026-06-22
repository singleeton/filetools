'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  ToolContainer, DropZone, FileList, DownloadSection, ProcessingStatus, ErrorAlert,
} from '@/components/shared'
import { useFileUpload } from '@/hooks/use-file-upload'
import { useToolExecution } from '@/hooks/use-tool-execution'
import { useDictionary } from '@/lib/i18n/dictionary-context'
import { toolConfigs } from '@/lib/tool-configs'
import { formatFileSize } from '@/utils/file-validation'
import { CompressOptions, type CompressionLevel } from './compress-options'

const config = toolConfigs['pdf-compress']

export function PdfCompressClient() {
  const { dict } = useDictionary()
  const toolDict = dict.tool['pdf-compress']

  const upload = useFileUpload({ maxSizeBytes: config.maxFileSize, acceptedTypes: config.acceptedTypes, maxFiles: config.maxFiles })
  const execution = useToolExecution()
  const [level, setLevel] = useState<CompressionLevel>('medium')

  const handleProcess = useCallback(async () => {
    const filesToProcess = upload.validFiles.map((f) => f.file)
    if (filesToProcess.length === 0) return
    await execution.execute(config.id, filesToProcess, { level })
  }, [upload.validFiles, execution, level])

  const handleReset = useCallback(() => { upload.clearFiles(); execution.reset(); setLevel('medium') }, [upload, execution])

  if (execution.state === 'done' && execution.resultUrl && execution.resultFileName) {
    const originalSize = upload.validFiles[0]?.size ?? 0
    return (
      <ToolContainer toolId={config.id} title={toolDict.name} description={toolDict.description} href="/pdf-compress">
        <div className="space-y-4">
          {originalSize > 0 && (
            <div className="rounded-lg border bg-card p-4 text-center text-sm text-muted-foreground">
              {dict.compress.original}: {formatFileSize(originalSize)}
            </div>
          )}
          <DownloadSection fileName={execution.resultFileName} fileUrl={execution.resultUrl} onReset={handleReset} />
        </div>
      </ToolContainer>
    )
  }

  if (execution.state === 'processing') {
    return (
      <ToolContainer toolId={config.id} title={toolDict.name} description={toolDict.description} href="/pdf-compress">
        <ProcessingStatus progress={execution.progress} message={dict.ui.processing.compressing} />
      </ToolContainer>
    )
  }

  return (
    <ToolContainer toolId={config.id} title={toolDict.name} description={toolDict.description} href="/pdf-compress">
      <div className="space-y-6">
        {execution.error && <ErrorAlert message={execution.error} />}
        <DropZone onFilesSelected={upload.addFiles} acceptedTypes={config.acceptedTypes} maxFileSize={config.maxFileSize} maxFiles={config.maxFiles} />
        <FileList files={upload.files} onRemove={upload.removeFile} />
        {upload.validFiles.length > 0 && (
          <>
            <CompressOptions level={level} onLevelChange={setLevel} />
            <div className="flex justify-center">
              <Button size="lg" onClick={handleProcess}>{dict.compress.button}</Button>
            </div>
          </>
        )}
      </div>
    </ToolContainer>
  )
}
