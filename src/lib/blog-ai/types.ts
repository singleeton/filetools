export type BlogProviderName = 'openai'

export interface BlogGenerationInput {
  locale: string
  topic: string
  toolContext: { name: string; description: string; href: string }[]
}

export interface BlogGenerationResult {
  title: string
  slug: string
  excerpt: string
  content: string
  metaDescription: string
}

export interface BlogProvider {
  readonly name: BlogProviderName
  generatePost(input: BlogGenerationInput): Promise<BlogGenerationResult>
}
