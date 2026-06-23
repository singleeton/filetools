'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ToolContainer, DropZone, FileList, DownloadSection, ProcessingStatus, ErrorAlert,
} from '@/components/shared'
import { useFileUpload } from '@/hooks/use-file-upload'
import { useToolExecution } from '@/hooks/use-tool-execution'
import { useDictionary } from '@/lib/i18n/dictionary-context'
import { toolConfigs } from '@/lib/tool-configs'

const config = toolConfigs['image-resize']

export function ImageResizeClient() {
  const { dict } = useDictionary()
  const toolDict = dict.tool['image-resize']
  const upload = useFileUpload({ maxSizeBytes: config.maxFileSize, acceptedTypes: config.acceptedTypes, maxFiles: config.maxFiles })
  const execution = useToolExecution()
  const [width, setWidth] = useState('800')
  const [height, setHeight] = useState('')

  const handleProcess = useCallback(async () => {
    const files = upload.validFiles.map((f) => f.file)
    if (files.length === 0) return
    await execution.execute(config.id, files, {
      width: parseInt(width) || undefined,
      height: parseInt(height) || undefined,
      fit: 'inside',
    })
  }, [upload.validFiles, execution, width, height])

  const handleReset = useCallback(() => { upload.clearFiles(); execution.reset() }, [upload, execution])

  if (execution.state === 'done' && execution.resultUrl && execution.resultFileName) {
    return (
      <ToolContainer toolId={config.id} title={toolDict.name} description={toolDict.description} href="/image-resize">
        <DownloadSection fileName={execution.resultFileName} fileUrl={execution.resultUrl} onReset={handleReset} />
      </ToolContainer>
    )
  }

  if (execution.state === 'processing') {
    return (
      <ToolContainer toolId={config.id} title={toolDict.name} description={toolDict.description} href="/image-resize">
        <ProcessingStatus progress={execution.progress} />
      </ToolContainer>
    )
  }

  return (
    <ToolContainer toolId={config.id} title={toolDict.name} description={toolDict.description} href="/image-resize">
      <div className="space-y-6">
        {execution.error && <ErrorAlert message={execution.error} />}
        <DropZone onFilesSelected={upload.addFiles} acceptedTypes={config.acceptedTypes} maxFileSize={config.maxFileSize} maxFiles={config.maxFiles} />
        <FileList files={upload.files} onRemove={upload.removeFile} />
        {upload.validFiles.length > 0 && (
          <>
            <div className="rounded-lg border bg-card p-6 space-y-4">
              <h3 className="text-sm font-semibold">Dimensions</h3>
              <div className="flex items-center gap-4">
                <div className="space-y-1">
                  <Label>Width (px)</Label>
                  <Input type="number" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="800" className="w-32" />
                </div>
                <span className="mt-6 text-muted-foreground">×</span>
                <div className="space-y-1">
                  <Label>Height (px)</Label>
                  <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="Auto" className="w-32" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Leave height empty to maintain aspect ratio</p>
            </div>
            <div className="flex justify-center">
              <Button size="lg" onClick={handleProcess}>Resize Image</Button>
            </div>
          </>
        )}
      </div>
    </ToolContainer>
  )
}
