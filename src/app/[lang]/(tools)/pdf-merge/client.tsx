'use client'

import { ToolPage } from '@/components/shared'
import { toolConfigs } from '@/lib/tool-configs'

export function PdfMergeClient() {
  return <ToolPage config={toolConfigs['pdf-merge']} sortable />
}
