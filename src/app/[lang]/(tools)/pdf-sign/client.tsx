'use client'

import { useState, useCallback } from 'react'
import { ToolContainer } from '@/components/shared/tool-container'
import { DropZone } from '@/components/shared/drop-zone'
import { SignEditor } from './sign-editor'
import { toolConfigs } from '@/lib/tool-configs'
import { useDictionary } from '@/lib/i18n/dictionary-context'

const config = toolConfigs['pdf-sign']

export function PdfSignClient() {
  const { dict } = useDictionary()
  const toolDict = dict.tool['pdf-sign']
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  const handleFilesSelected = useCallback((files: FileList | File[]) => {
    const file = files instanceof FileList ? files[0] : files[0]
    if (file) setPdfFile(file)
  }, [])

  const handleReset = useCallback(() => {
    setPdfFile(null)
  }, [])

  return (
    <ToolContainer toolId={config.id} title={toolDict.name} description={toolDict.description} href={`/${config.id}`}>
      {pdfFile ? (
        <SignEditor pdfFile={pdfFile} onReset={handleReset} />
      ) : (
        <DropZone
          onFilesSelected={handleFilesSelected}
          acceptedTypes={config.acceptedTypes}
          maxFileSize={config.maxFileSize}
          maxFiles={1}
          multiple={false}
        />
      )}
    </ToolContainer>
  )
}
