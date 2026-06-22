'use client'

import { useCallback, useState, useRef } from 'react'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatFileSize } from '@/utils/file-validation'
import { useDictionary } from '@/lib/i18n/dictionary-context'

interface DropZoneProps {
  onFilesSelected: (files: FileList | File[]) => void
  acceptedTypes: string[]
  maxFileSize: number
  maxFiles: number
  multiple?: boolean
  disabled?: boolean
}

export function DropZone({
  onFilesSelected,
  acceptedTypes,
  maxFileSize,
  maxFiles,
  multiple = false,
  disabled = false,
}: DropZoneProps) {
  const { dict } = useDictionary()
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled) setIsDragging(true)
    },
    [disabled],
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (disabled) return
      if (e.dataTransfer.files.length > 0) {
        onFilesSelected(e.dataTransfer.files)
      }
    },
    [disabled, onFilesSelected],
  )

  const handleClick = () => {
    if (!disabled) inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files)
      e.target.value = ''
    }
  }

  const t = dict.ui.dropzone

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50',
        disabled && 'pointer-events-none opacity-50',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />

      <Upload
        className={cn(
          'mb-4 h-10 w-10',
          isDragging ? 'text-primary' : 'text-muted-foreground',
        )}
      />

      <p className="text-center text-sm font-medium">
        {isDragging ? (
          t.drag
        ) : (
          <>
            {t.browse}{' '}
            <span className="text-primary underline">{t.browseLink}</span>
          </>
        )}
      </p>

      <p className="mt-2 text-center text-xs text-muted-foreground">
        {acceptedTypes.map((tp) => tp.replace('.', '').toUpperCase()).join(', ')}
        {' • '}
        {t.maxSize} {formatFileSize(maxFileSize)}
        {maxFiles > 1 && ` • ${t.upTo} ${maxFiles} ${t.files}`}
      </p>
    </div>
  )
}
