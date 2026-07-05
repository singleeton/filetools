'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ImageUp, Loader2, X, Images } from 'lucide-react'

interface MediaItem {
  id: string
  url: string
  filename: string
}

export function ImageUploadField({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (url: string) => void
  label: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [showLibrary, setShowLibrary] = useState(false)
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loadingLibrary, setLoadingLibrary] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Upload failed')
        return
      }
      onChange(data.url)
    } catch {
      setError('Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const openLibrary = async () => {
    setShowLibrary(true)
    setLoadingLibrary(true)
    try {
      const res = await fetch('/api/admin/upload')
      const data = await res.json()
      setMedia(data.media || [])
    } finally {
      setLoadingLibrary(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {value ? (
        <div className="relative w-fit">
          <Image
            src={value}
            alt={label}
            width={160}
            height={100}
            unoptimized
            className="h-24 w-40 rounded-lg border object-cover"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
          ) : (
            <ImageUp className="mr-1 h-3.5 w-3.5" />
          )}
          Upload image
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={openLibrary}>
          <Images className="mr-1 h-3.5 w-3.5" />
          Browse existing
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {showLibrary && (
        <div className="rounded-lg border bg-card p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Media library</span>
            <button type="button" onClick={() => setShowLibrary(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          {loadingLibrary ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : media.length === 0 ? (
            <p className="text-sm text-muted-foreground">No uploads yet.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {media.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => {
                    onChange(m.url)
                    setShowLibrary(false)
                  }}
                  className="overflow-hidden rounded-md border hover:border-primary"
                >
                  <Image src={m.url} alt={m.filename} width={80} height={60} unoptimized className="h-14 w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
