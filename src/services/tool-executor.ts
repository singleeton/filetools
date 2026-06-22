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
