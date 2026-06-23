'use client'

import { ToolPage } from '@/components/shared'
import { toolConfigs } from '@/lib/tool-configs'

export function RemoveBgClient() {
  return <ToolPage config={toolConfigs['remove-bg']} />
}
