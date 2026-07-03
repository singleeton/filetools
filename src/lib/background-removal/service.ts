import { ProviderFactory } from './factory'
import type { ProviderName, RemovalOptions, RemovalResult } from './types'

const ACTIVE_PROVIDER: ProviderName = 'local-ai'

export const BackgroundRemovalService = {
  async removeBackground(file: File, options?: RemovalOptions): Promise<RemovalResult> {
    const provider = ProviderFactory.create(ACTIVE_PROVIDER)
    return provider.removeBackground(file, options)
  },
}
