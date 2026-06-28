'use client'

import { useState, useCallback } from 'react'
import { ToolContainer } from '@/components/shared/tool-container'
import { DropZone } from '@/components/shared/drop-zone'
import { BgEditor } from './bg-editor'
import { toolConfigs } from '@/lib/tool-configs'
import { useDictionary } from '@/lib/i18n/dictionary-context'

const config = toolConfigs['remove-bg']

export function RemoveBgClient() {
  const { dict } = useDictionary()
  const toolDict = dict.tool['remove-bg']
  const [imageFile, setImageFile] = useState<File | null>(null)

  const handleFilesSelected = useCallback((files: FileList | File[]) => {
    const file = files instanceof FileList ? files[0] : files[0]
    if (file) setImageFile(file)
  }, [])

  const handleReset = useCallback(() => {
    setImageFile(null)
  }, [])

  return (
    <ToolContainer toolId={config.id} title={toolDict.name} description={toolDict.description} href={`/${config.id}`}>
      {imageFile ? (
        <BgEditor imageFile={imageFile} onReset={handleReset} />
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
