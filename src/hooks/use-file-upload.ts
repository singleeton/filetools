'use client'

import { useState, useCallback } from 'react'
import type { UploadedFile, FileStatus } from '@/types/tool'
import {
  validateFile,
  generateFileId,
  type FileValidationOptions,
} from '@/utils/file-validation'
import { trackEvent } from '@/lib/analytics'

interface UseFileUploadOptions extends FileValidationOptions {
  maxFiles: number
}

export function useFileUpload(options: UseFileUploadOptions) {
  const [files, setFiles] = useState<UploadedFile[]>([])

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles)

      setFiles((prev) => {
        const remaining = options.maxFiles - prev.length
        if (remaining <= 0) return prev

        const filesToAdd = fileArray.slice(0, remaining)

        const uploadedFiles: UploadedFile[] = filesToAdd
          .map((file) => {
            const validation = validateFile(file, {
              maxSizeBytes: options.maxSizeBytes,
              acceptedTypes: options.acceptedTypes,
            })

            return {
              id: generateFileId(),
              file,
              name: file.name,
              size: file.size,
              type: file.type,
              status: (validation.valid ? 'idle' : 'error') as FileStatus,
              progress: 0,
              error: validation.error,
            }
          })

        trackEvent('upload_start', {
          fileCount: uploadedFiles.length,
          totalSize: uploadedFiles.reduce((s, f) => s + f.size, 0),
        })

        return [...prev, ...uploadedFiles]
      })
    },
    [options.maxFiles, options.maxSizeBytes, options.acceptedTypes],
  )

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const clearFiles = useCallback(() => {
    setFiles([])
  }, [])

  const updateFileStatus = useCallback(
    (id: string, status: FileStatus, progress?: number, error?: string) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                status,
                progress: progress ?? f.progress,
                error: error ?? f.error,
              }
            : f,
        ),
      )
    },
    [],
  )

  const reorderFiles = useCallback((fromIndex: number, toIndex: number) => {
    setFiles((prev) => {
      const updated = [...prev]
      const [moved] = updated.splice(fromIndex, 1)
      updated.splice(toIndex, 0, moved)
      return updated
    })
  }, [])

  const validFiles = files.filter((f) => f.status !== 'error')
  const hasErrors = files.some((f) => f.status === 'error')
  const isProcessing = files.some(
    (f) => f.status === 'uploading' || f.status === 'processing',
  )
  const allDone = validFiles.length > 0 && validFiles.every((f) => f.status === 'done')

  return {
    files,
    addFiles,
    removeFile,
    clearFiles,
    updateFileStatus,
    reorderFiles,
    validFiles,
    hasErrors,
    isProcessing,
    allDone,
  }
}
