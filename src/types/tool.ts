export type ToolCategory = 'pdf' | 'word' | 'excel' | 'image' | 'ai' | 'video' | 'audio' | 'file'

export interface Tool {
  id: string
  name: string
  description: string
  href: string
  category: ToolCategory
  icon: string
  isNew?: boolean
  isPremium?: boolean
  /** Curated "Popular" badge in nav/mega-menu — not live usage data */
  isPopular?: boolean
  /** Path to a real product screenshot used in the landing page showcase */
  screenshot?: string
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
