import type { BackgroundProvider, RemovalOptions, RemovalResult } from '../types'

export class LocalAIProvider implements BackgroundProvider {
  readonly name = 'local-ai' as const

  async removeBackground(file: File, options?: RemovalOptions): Promise<RemovalResult> {
    const { removeBackground } = await import('@imgly/background-removal')
    const blob = await removeBackground(file, {
      progress: (key: string, current: number, total: number) => {
        if (total > 0) {
          const stage = key.startsWith('fetch') ? 'model' : 'inference'
          options?.onProgress?.(current / total, stage as 'model' | 'inference')
        }
      },
    })
    return { blob }
  }
}
