import type { BlogProvider, BlogProviderName } from './types'
import { OpenAiBlogProvider } from './providers/openai.provider'
import { GeminiBlogProvider } from './providers/gemini.provider'

export class BlogProviderFactory {
  static create(name: BlogProviderName): BlogProvider {
    switch (name) {
      case 'gemini':
        return new GeminiBlogProvider()
      case 'openai':
        return new OpenAiBlogProvider()
    }
  }
}
