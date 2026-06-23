'use client'

import { ToolPage } from '@/components/shared'
import { toolConfigs } from '@/lib/tool-configs'

export function PngToJpgClient() {
  return <ToolPage config={toolConfigs['png-to-jpg']} />
}
