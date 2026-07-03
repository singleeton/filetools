import type { BackgroundProvider, ProviderName } from './types'
import { LocalAIProvider } from './providers/local-ai.provider'
import { RemoveBgProvider } from './providers/remove-bg.provider'

export class ProviderFactory {
  static create(name: ProviderName): BackgroundProvider {
    switch (name) {
      case 'local-ai':
        return new LocalAIProvider()
      case 'remove-bg':
        return new RemoveBgProvider()
      case 'clipdrop':
      case 'bria-ai':
        throw new Error(`Provider '${name}' is not yet implemented`)
    }
  }
}
