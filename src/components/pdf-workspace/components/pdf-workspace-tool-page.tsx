'use client'

import { useCallback } from 'react'
import { ToolContainer, DropZone, ErrorAlert } from '@/components/shared'
import { useFileUpload } from '@/hooks/use-file-upload'
import { useDictionary } from '@/lib/i18n/dictionary-context'
import { toolConfigs } from '@/lib/tool-configs'
import { PdfWorkspace, type PdfWorkspaceLabels } from './pdf-workspace'
import type { WorkspaceTool } from '../types'

// Every tool page mounted on PdfWorkspace shares this exact shell: the
// pre-upload landing state (ToolContainer + DropZone) is tool-specific SEO
// surface, everything after a file is loaded is the same workspace. New
// PdfWorkspace-backed tools just need a `toolConfigs`/dictionary entry and a
// one-line page here — no new client component.
type WorkspaceToolId = 'pdf-split' | 'pdf-rotate'

interface PdfWorkspaceToolPageProps {
  toolId: WorkspaceToolId
  defaultTool: WorkspaceTool
  outputBaseName: string
}

export function PdfWorkspaceToolPage({ toolId, defaultTool, outputBaseName }: PdfWorkspaceToolPageProps) {
  const { dict } = useDictionary()
  const toolDict = dict.tool[toolId]
  const ws = dict.pdfWorkspace
  const config = toolConfigs[toolId]

  const upload = useFileUpload({
    maxSizeBytes: config.maxFileSize,
    acceptedTypes: config.acceptedTypes,
    maxFiles: config.maxFiles,
  })

  const file = upload.validFiles[0]?.file ?? null

  const handleReset = useCallback(() => {
    upload.clearFiles()
  }, [upload])

  const labels: PdfWorkspaceLabels = {
    loading: ws.loading,
    resetButton: ws.resetButton,
    errors: {
      'password-protected': ws.errors.passwordProtected,
      corrupted: ws.errors.corrupted,
      empty: ws.errors.empty,
      invalid: ws.errors.invalid,
    },
    header: ws.header,
    sidebar: ws.sidebar,
    toolbar: ws.toolbar,
    thumbnail: ws.thumbnail,
    inspector: ws.inspector,
    statusBar: ws.statusBar,
    floatingToolbar: ws.floatingToolbar,
    liveSummary: ws.liveSummary,
    processing: ws.processing,
    result: ws.result,
    finalPreview: ws.finalPreview,
    bookmarks: ws.bookmarks,
    pageLabelsPanel: ws.pageLabelsPanel,
    toolName: toolDict.name,
  }

  if (!file) {
    return (
      <ToolContainer toolId={config.id} title={toolDict.name} description={toolDict.description} href={`/${toolId}`}>
        <div className="space-y-6">
          {upload.hasErrors && <ErrorAlert message={upload.files.find((f) => f.error)?.error ?? ''} />}
          <DropZone
            onFilesSelected={upload.addFiles}
            acceptedTypes={config.acceptedTypes}
            maxFileSize={config.maxFileSize}
            maxFiles={config.maxFiles}
          />
        </div>
      </ToolContainer>
    )
  }

  return (
    <div className="container mx-auto max-w-[1600px] px-4 py-8">
      <PdfWorkspace
        file={file}
        exportSlug={toolId}
        outputBaseName={outputBaseName}
        defaultTool={defaultTool}
        onReset={handleReset}
        labels={labels}
      />
    </div>
  )
}
