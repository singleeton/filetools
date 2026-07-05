import type { BlogProvider, BlogProviderName } from './types'
import { OpenAiBlogProvider } from './providers/openai.provider'

export class BlogProviderFactory {
  static create(name: BlogProviderName): BlogProvider {
    switch (name) {
      case 'openai':
        return new OpenAiBlogProvider()
    }
  }
}
