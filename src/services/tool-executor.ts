export interface ExecutionResult {
  success: true
  blob: Blob
  fileName: string
}

export interface ExecutionError {
  success: false
  error: string
}

export type ExecutionResponse = ExecutionResult | ExecutionError

export async function executeToolClient(
  slug: string,
  files: File[],
  options?: Record<string, unknown>,
  onProgress?: (progress: number) => void,
): Promise<ExecutionResponse> {
  const formData = new FormData()

  files.forEach((file) => {
    formData.append('files', file)
  })

  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      formData.append(key, JSON.stringify(value))
    })
  }

  onProgress?.(10)

  let response: Response
  try {
    response = await fetch(`/api/tools/${slug}`, {
      method: 'POST',
      body: formData,
    })
  } catch {
    return { success: false, error: 'Network error. Please try again.' }
  }

  onProgress?.(70)

  if (!response.ok) {
    try {
      const errorData = await response.json()
      return { success: false, error: errorData.error || 'Processing failed' }
    } catch {
      return { success: false, error: `Server error (${response.status})` }
    }
  }

  const blob = await response.blob()
  const fileName =
    response.headers.get('X-File-Name') || `output-${slug}`

  onProgress?.(100)

  return { success: true, blob, fileName }
}

export function createDownloadUrl(blob: Blob): string {
  return URL.createObjectURL(blob)
}

export function revokeDownloadUrl(url: string): void {
  URL.revokeObjectURL(url)
}

export interface MultiFileResult {
  fileName: string
  url: string
  size: number
  pageCount?: number
}

export interface MultiExecutionResult {
  success: true
  files: MultiFileResult[]
}

export interface MultiExecutionError {
  success: false
  error: string
}

export type MultiExecutionResponse = MultiExecutionResult | MultiExecutionError

/**
 * Like executeToolClient, but for handlers that may return multiple output
 * files (JSON of Blob URLs) instead of a single raw file. Falls back to
 * wrapping a single-file binary response in a one-element files[] array, so
 * callers never need to branch on response shape themselves.
 */
export async function executeMultiFileToolClient(
  slug: string,
  files: File[],
  options?: Record<string, unknown>,
): Promise<MultiExecutionResponse> {
  const formData = new FormData()

  files.forEach((file) => {
    formData.append('files', file)
  })

  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      formData.append(key, JSON.stringify(value))
    })
  }

  let response: Response
  try {
    response = await fetch(`/api/tools/${slug}`, {
      method: 'POST',
      body: formData,
    })
  } catch {
    return { success: false, error: 'Network error. Please try again.' }
  }

  if (!response.ok) {
    try {
      const errorData = await response.json()
      return { success: false, error: errorData.error || 'Processing failed' }
    } catch {
      return { success: false, error: `Server error (${response.status})` }
    }
  }

  const contentType = response.headers.get('Content-Type') || ''

  if (contentType.includes('application/json')) {
    const data = (await response.json()) as { files: MultiFileResult[] }
    return { success: true, files: data.files }
  }

  const blob = await response.blob()
  const fileName = response.headers.get('X-File-Name') || `output-${slug}`

  return {
    success: true,
    files: [{ fileName, url: createDownloadUrl(blob), size: blob.size }],
  }
}
