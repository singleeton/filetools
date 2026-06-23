'use client'

import { ToolPage } from '@/components/shared'
import { toolConfigs } from '@/lib/tool-configs'

export function JpgToPngClient() {
  return <ToolPage config={toolConfigs['jpg-to-png']} />
}
