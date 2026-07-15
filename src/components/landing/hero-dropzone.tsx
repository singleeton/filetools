'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

const EXTENSION_CATEGORY: Record<string, string> = {
  pdf: 'pdf',
  doc: 'word',
  docx: 'word',
  xls: 'excel',
  xlsx: 'excel',
  csv: 'excel',
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  webp: 'image',
  gif: 'image',
  heic: 'image',
  mp4: 'video',
  mov: 'video',
  avi: 'video',
  mkv: 'video',
}

function resolveToolPath(lang: string, fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  const category = EXTENSION_CATEGORY[ext]
  return category ? `/${lang}/tools#${category}` : `/${lang}/tools`
}

interface HeroDropzoneProps {
  lang: string
  hint: string
}

export function HeroDropzone({ lang, hint }: HeroDropzoneProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = (file: File | undefined) => {
    if (!file) return
    router.push(resolveToolPath(lang, file.name))
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        handleFile(e.dataTransfer.files?.[0])
      }}
      className={cn(
        'mx-auto mt-6 flex max-w-md cursor-pointer items-center justify-center gap-2 rounded-full border border-dashed px-5 py-3 text-sm text-muted-foreground transition-colors',
        isDragging ? 'border-primary bg-primary/5 text-foreground' : 'hover:border-primary/50 hover:text-foreground',
      )}
    >
      <Upload className="h-4 w-4 shrink-0" />
      <span>{hint}</span>
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
