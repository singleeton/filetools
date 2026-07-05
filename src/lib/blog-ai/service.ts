import { BlogProviderFactory } from './factory'
import type { BlogProviderName, BlogGenerationResult } from './types'
import { tools } from '@/lib/tools-registry'
import { locales } from '@/lib/i18n/config'

const ACTIVE_PROVIDER: BlogProviderName = 'openai'

function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0)
  const diff = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start
  return Math.floor(diff / 86400000)
}

export interface DailyDraft {
  locale: string
  result: BlogGenerationResult
  translationKey: string
}

export const BlogAiService = {
  async generateDailyDrafts(date: Date = new Date()): Promise<DailyDraft[]> {
    const provider = BlogProviderFactory.create(ACTIVE_PROVIDER)
    const tool = tools[dayOfYear(date) % tools.length]
    const dateStr = date.toISOString().slice(0, 10)
    const translationKey = `${dateStr}-${tool.id}`

    const toolContext = tools.map((t) => ({ name: t.name, description: t.description, href: t.href }))

    const drafts = await Promise.all(
      locales.map(async (locale) => {
        const result = await provider.generatePost({
          locale,
          topic: tool.name,
          toolContext,
        })
        return { locale, result, translationKey }
      }),
    )

    return drafts
  },
}
