import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { executeTool } from '@/core/tool-engine'
import { loadAllHandlers } from '@/core/tool-engine/loader'
import { getToolConfig } from '@/lib/tool-configs'
import { logger } from '@/core/tool-engine/logger'
import { checkUsageLimit, incrementUsage } from '@/lib/usage-limiter'

export const runtime = 'nodejs'
export const maxDuration = 30


loadAllHandlers()

const STATUS_MAP = {
  INVALID_TOOL: 404,
  INVALID_INPUT: 400,
  FILE_TOO_LARGE: 413,
  PROCESSING_ERROR: 500,
  PASSWORD_PROTECTED: 422,
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

  const usage = await checkUsageLimit()
  if (!usage.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Daily limit reached (${usage.limit}/${usage.plan}). ${usage.plan === 'guest' ? 'Sign up for more.' : 'Upgrade to Premium for unlimited.'}`,
      },
      { status: 429 },
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

  await incrementUsage()

  if ('files' in result) {
    const uploaded = await Promise.all(
      result.files.map(async (f) => {
        const blob = await put(
          `tool-outputs/${crypto.randomUUID()}-${f.fileName}`,
          Buffer.from(f.data),
          { access: 'public', contentType: f.mimeType },
        )
        return {
          fileName: f.fileName,
          url: blob.url,
          size: f.data.byteLength,
          pageCount: f.pageCount,
        }
      }),
    )

    return NextResponse.json({ success: true, files: uploaded })
  }

  return new Response(Buffer.from(result.file), {
    status: 200,
    headers: {
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="${result.fileName}"`,
      'Content-Length': String(result.file.byteLength),
      'X-File-Name': result.fileName,
      'Cache-Control': 'no-store',
    },
  })
}
