export type ProviderName = 'local-ai' | 'remove-bg' | 'clipdrop' | 'bria-ai'

export interface RemovalOptions {
  onProgress?: (progress: number, stage: 'model' | 'inference') => void
}

export interface RemovalResult {
  blob: Blob
}

export interface BackgroundProvider {
  readonly name: ProviderName
  removeBackground(file: File, options?: RemovalOptions): Promise<RemovalResult>
}
