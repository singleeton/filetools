export interface ToolInput {
  slug: string
  files: File[]
  options?: Record<string, unknown>
}

export type ToolResult =
  | {
      success: true
      file: Uint8Array
      fileName: string
      mimeType: string
    }
  | {
      success: true
      files: {
        fileName: string
        mimeType: string
        data: Uint8Array
        pageCount?: number
      }[]
    }

export interface ToolError {
  success: false
  error: string
  code:
    | 'INVALID_TOOL'
    | 'INVALID_INPUT'
    | 'PROCESSING_ERROR'
    | 'FILE_TOO_LARGE'
    | 'PASSWORD_PROTECTED'
}

export type ToolOutput = ToolResult | ToolError

export interface ToolHandler {
  execute: (files: File[], options?: Record<string, unknown>) => Promise<ToolResult>
}

export interface ToolRegistryEntry {
  slug: string
  handler: ToolHandler
}
