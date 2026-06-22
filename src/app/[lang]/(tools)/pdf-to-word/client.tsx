'use client'

import { ToolPage } from '@/components/shared'
import { toolConfigs } from '@/lib/tool-configs'

export function PdfToWordClient() {
  return <ToolPage config={toolConfigs['pdf-to-word']} />
}
