'use client'

import { PdfWorkspaceToolPage } from '@/components/pdf-workspace'

export function PdfSplitClient() {
  return <PdfWorkspaceToolPage toolId="pdf-split" defaultTool="split" outputBaseName="split" />
}
