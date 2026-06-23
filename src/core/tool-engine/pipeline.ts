import { getToolHandler } from './registry'
import { getToolConfig } from '@/lib/tool-configs'
import { validateFile } from '@/utils/file-validation'
import { logger } from './logger'
import type { ToolInput, ToolOutput } from './types'

export async function executeTool(input: ToolInput): Promise<ToolOutput> {
  const { slug, files, options } = input
  const startTime = Date.now()

  logger.info(slug, `Execution started | files: ${files.length}`)

  // --- VALIDATION LAYER ---

  const config = getToolConfig(slug)
  if (!config) {
    logger.error(slug, 'Tool config not found')
    return { success: false, error: `Unknown tool: ${slug}`, code: 'INVALID_TOOL' }
  }

  const handler = getToolHandler(slug)
  if (!handler) {
    logger.error(slug, 'Handler not registered')
    return {
      success: false,
      error: `No handler registered for: ${slug}`,
      code: 'INVALID_TOOL',
    }
  }

  if (files.length === 0) {
    logger.warn(slug, 'No files provided')
    return { success: false, error: 'No files provided', code: 'INVALID_INPUT' }
  }

  if (files.length > config.maxFiles) {
    logger.warn(slug, `File count ${files.length} exceeds max ${config.maxFiles}`)
    return {
      success: false,
      error: `Too many files. Maximum ${config.maxFiles} allowed.`,
      code: 'INVALID_INPUT',
    }
  }

  for (const file of files) {
    const validation = validateFile(file, {
      maxSizeBytes: config.maxFileSize,
      acceptedTypes: config.acceptedTypes,
    })
    if (!validation.valid) {
      logger.warn(slug, `Validation failed for ${file.name}: ${validation.error}`)
      return { success: false, error: validation.error!, code: 'INVALID_INPUT' }
    }
  }

  logger.info(slug, 'Validation passed, starting handler')

  // --- EXECUTION LAYER (isolated) ---

  try {
    const result = await handler.execute(files, options)
    logger.timing(slug, 'Handler execution', startTime)
    logger.info(
      slug,
      `Output: ${result.fileName} (${(result.file.byteLength / 1024).toFixed(1)} KB)`,
    )
    return result
  } catch (err) {
    logger.error(slug, 'Handler threw an exception', err)
    const message =
      err instanceof Error ? err.message : 'An unexpected error occurred'

    const isInputError =
      message.includes('Failed to parse PDF') ||
      message.includes('No PDF header') ||
      message.includes('No valid pages') ||
      message.includes('Corrupted zip') ||
      message.includes('No extractable text') ||
      message.includes('Could not read') ||
      message.includes('Could not extract') ||
      message.includes('End of data reached')

    return {
      success: false,
      error: isInputError
        ? 'The uploaded file appears to be corrupted or invalid. Please try a different file.'
        : message,
      code: isInputError ? 'INVALID_INPUT' : 'PROCESSING_ERROR',
    }
  }
}
