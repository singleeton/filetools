export type ToolCategory = 'pdf' | 'convert' | 'image' | 'ai' | 'video'

export interface Tool {
  id: string
  name: string
  description: string
  href: string
  category: ToolCategory
  icon: string
  isNew?: boolean
  isPremium?: boolean
}

export interface ToolPageProps {
  params: Promise<{ slug: string }>
}

export type FileStatus = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

export interface UploadedFile {
  id: string
  file: File
  name: string
  size: number
  type: string
  status: FileStatus
  progress: number
  error?: string
}

export interface ToolConfig {
  id: string
  name: string
  description: string
  shortDescription: string
  acceptedTypes: string[]
  maxFileSize: number
  maxFiles: number
  allowMultiple: boolean
}
