'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

function resolveToolPath(lang: string, fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') return `/${lang}/pdf-merge`
  if (ext === 'doc' || ext === 'docx') return `/${lang}/word-to-pdf`
  if (ext === 'jpg' || ext === 'jpeg') return `/${lang}/jpg-to-png`
  if (ext === 'png') return `/${lang}/png-to-jpg`
  return `/${lang}/tools`
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
