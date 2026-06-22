'use client'

import { ToolPage } from '@/components/shared'
import { toolConfigs } from '@/lib/tool-configs'

export function WordToPdfClient() {
  return <ToolPage config={toolConfigs['word-to-pdf']} />
}
