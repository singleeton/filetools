const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB'] as const

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / Math.pow(1024, i)
  return `${size.toFixed(i === 0 ? 0 : 1)} ${FILE_SIZE_UNITS[i]}`
}

export function generateFileId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export interface FileValidationOptions {
  maxSizeBytes: number
  acceptedTypes: string[]
}

export interface FileValidationResult {
  valid: boolean
  error?: string
}

export function validateFile(
  file: File,
  options: FileValidationOptions,
): FileValidationResult {
  if (file.size > options.maxSizeBytes) {
    return {
      valid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds the maximum allowed size (${formatFileSize(options.maxSizeBytes)})`,
    }
  }

  if (options.acceptedTypes.length > 0) {
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`
    const isAccepted = options.acceptedTypes.some((type) => {
      if (type.startsWith('.')) return fileExtension === type.toLowerCase()
      if (type.includes('*')) {
        const [mainType] = type.split('/')
        return file.type.startsWith(`${mainType}/`)
      }
      return file.type === type
    })

    if (!isAccepted) {
      return {
        valid: false,
        error: `File type "${file.type || fileExtension}" is not supported. Accepted: ${options.acceptedTypes.join(', ')}`,
      }
    }
  }

  return { valid: true }
}
