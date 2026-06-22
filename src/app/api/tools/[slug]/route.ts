import { NextRequest, NextResponse } from 'next/server'
import { executeTool } from '@/core/tool-engine'
import { loadAllHandlers } from '@/core/tool-engine/loader'
import { getToolConfig } from '@/lib/tool-configs'
import { logger } from '@/core/tool-engine/logger'

loadAllHandlers()

const STATUS_MAP = {
  INVALID_TOOL: 404,
  INVALID_INPUT: 400,
  FILE_TOO_LARGE: 413,
  PROCESSING_ERROR: 500,
} as const

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  const config = getToolConfig(slug)
  if (!config) {
    return NextResponse.json(
      { success: false, error: 'Tool not found' },
      { status: 404 },
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    logger.error(slug, 'Failed to parse FormData')
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 },
    )
  }

  const files: File[] = []
  const options: Record<string, unknown> = {}

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      files.push(value)
    } else {
      try {
        options[key] = JSON.parse(value)
      } catch {
        options[key] = value
      }
    }
  }

  const result = await executeTool({ slug, files, options })

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: STATUS_MAP[result.code] },
    )
  }

  const responseBytes = new Uint8Array(result.file)

  return new NextResponse(responseBytes, {
    status: 200,
    headers: {
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="${result.fileName}"`,
      'Content-Length': String(responseBytes.byteLength),
      'X-File-Name': result.fileName,
      'Cache-Control': 'no-store',
    },
  })
}
