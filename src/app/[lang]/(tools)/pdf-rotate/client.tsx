'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { RotateCw } from 'lucide-react'
import {
  ToolContainer, DropZone, FileList, DownloadSection, ProcessingStatus, ErrorAlert,
} from '@/components/shared'
import { useFileUpload } from '@/hooks/use-file-upload'
import { useToolExecution } from '@/hooks/use-tool-execution'
import { useDictionary } from '@/lib/i18n/dictionary-context'
import { toolConfigs } from '@/lib/tool-configs'
import { cn } from '@/lib/utils'

const config = toolConfigs['pdf-rotate']
const ANGLES = [90, 180, 270]

export function PdfRotateClient() {
  const { dict } = useDictionary()
  const toolDict = dict.tool['pdf-rotate']
  const upload = useFileUpload({ maxSizeBytes: config.maxFileSize, acceptedTypes: config.acceptedTypes, maxFiles: config.maxFiles })
  const execution = useToolExecution()
  const [angle, setAngle] = useState(90)

  const handleProcess = useCallback(async () => {
    const files = upload.validFiles.map((f) => f.file)
    if (files.length === 0) return
    await execution.execute(config.id, files, { angle })
  }, [upload.validFiles, execution, angle])

  const handleReset = useCallback(() => { upload.clearFiles(); execution.reset() }, [upload, execution])

  if (execution.state === 'done' && execution.resultUrl && execution.resultFileName) {
    return (
      <ToolContainer toolId={config.id} title={toolDict.name} description={toolDict.description} href="/pdf-rotate">
        <DownloadSection fileName={execution.resultFileName} fileUrl={execution.resultUrl} onReset={handleReset} />
      </ToolContainer>
    )
  }

  if (execution.state === 'processing') {
    return (
      <ToolContainer toolId={config.id} title={toolDict.name} description={toolDict.description} href="/pdf-rotate">
        <ProcessingStatus progress={execution.progress} />
      </ToolContainer>
    )
  }

  return (
    <ToolContainer toolId={config.id} title={toolDict.name} description={toolDict.description} href="/pdf-rotate">
      <div className="space-y-6">
        {execution.error && <ErrorAlert message={execution.error} />}
        <DropZone onFilesSelected={upload.addFiles} acceptedTypes={config.acceptedTypes} maxFileSize={config.maxFileSize} maxFiles={config.maxFiles} />
        <FileList files={upload.files} onRemove={upload.removeFile} />
        {upload.validFiles.length > 0 && (
          <>
            <div className="rounded-lg border bg-card p-6 space-y-4">
              <h3 className="text-sm font-semibold">Rotation Angle</h3>
              <div className="flex gap-3">
                {ANGLES.map((a) => (
                  <button key={a} onClick={() => setAngle(a)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors',
                      angle === a ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50',
                    )}>
                    <RotateCw className="h-4 w-4" style={{ transform: `rotate(${a}deg)` }} />
                    {a}°
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <Button size="lg" onClick={handleProcess}>Rotate PDF</Button>
            </div>
          </>
        )}
      </div>
    </ToolContainer>
  )
}
