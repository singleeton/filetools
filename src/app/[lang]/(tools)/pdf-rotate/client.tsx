'use client'

import { PdfWorkspaceToolPage } from '@/components/pdf-workspace'

export function PdfRotateClient() {
  return <PdfWorkspaceToolPage toolId="pdf-rotate" defaultTool="rotate" outputBaseName="rotated" />
}
