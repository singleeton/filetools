import OpenAI from 'openai'
import type { BlogProvider, BlogGenerationInput, BlogGenerationResult } from '../types'

const LOCALE_LANGUAGE: Record<string, string> = {
  en: 'English',
  tr: 'Turkish',
  ru: 'Russian',
  zh: 'Simplified Chinese',
}

// Requires OPENAI_API_KEY environment variable (server-only, no NEXT_PUBLIC_ prefix)
export class OpenAiBlogProvider implements BlogProvider {
  readonly name = 'openai' as const

  async generatePost(input: BlogGenerationInput): Promise<BlogGenerationResult> {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('OPENAI_API_KEY is not set')

    const client = new OpenAI({ apiKey })
    const language = LOCALE_LANGUAGE[input.locale] || 'English'

    const toolList = input.toolContext
      .map((t) => `- ${t.name}: ${t.description} (${t.href})`)
      .join('\n')

    const systemPrompt = `You are a content marketer writing for FileTools, a free online file-conversion SaaS (PDF merge/split/compress, Word/Excel conversion, image tools). Write genuine, useful blog content about the given topic that naturally promotes the relevant tool — not generic filler. Write entirely in ${language}. Respond with a single JSON object only, no markdown fences, with these exact keys: "title" (string), "slug" (kebab-case URL slug in ASCII, no diacritics, English words are fine even for non-English locales), "excerpt" (1-2 sentence summary, string), "content" (full article body in Markdown, at least 400 words, may reference the tool's URL as a relative link), "metaDescription" (SEO meta description, max 160 characters).`

    const userPrompt = `Topic: ${input.topic}\n\nRelevant site tools:\n${toolList}\n\nWrite today's blog post.`

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    })

    const raw = completion.choices[0]?.message?.content
    if (!raw) throw new Error('OpenAI returned an empty response')

    let parsed: Partial<BlogGenerationResult>
    try {
      parsed = JSON.parse(raw)
    } catch {
      throw new Error('OpenAI response was not valid JSON')
    }

    if (!parsed.title || !parsed.slug || !parsed.excerpt || !parsed.content || !parsed.metaDescription) {
      throw new Error('OpenAI response is missing required fields')
    }

    return {
      title: parsed.title,
      slug: parsed.slug,
      excerpt: parsed.excerpt,
      content: parsed.content,
      metaDescription: parsed.metaDescription,
    }
  }
}
