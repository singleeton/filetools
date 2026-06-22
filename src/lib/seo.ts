import type { Metadata } from 'next'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { locales, type Locale } from '@/lib/i18n/config'
import { siteConfig } from '@/lib/site-config'

const toolKeywords: Record<string, string[]> = {
  'pdf-merge': ['pdf merge online', 'combine pdf files', 'merge pdf free', 'pdf combiner', 'join pdf'],
  'pdf-split': ['split pdf free', 'pdf splitter online', 'extract pdf pages', 'separate pdf pages', 'pdf page extractor'],
  'pdf-compress': ['compress pdf online', 'reduce pdf size', 'pdf compressor free', 'shrink pdf', 'make pdf smaller'],
  'word-to-pdf': ['word to pdf', 'convert docx to pdf', 'doc to pdf online', 'word to pdf converter free'],
  'pdf-to-word': ['pdf to word', 'convert pdf to docx', 'pdf to word converter free', 'pdf to editable word'],
}

export async function generateToolMetadata(
  lang: string,
  toolId: string,
): Promise<Metadata> {
  const dict = await getDictionary(lang as Locale)
  const meta = dict.meta[toolId as keyof typeof dict.meta]
  const alternates: Record<string, string> = {}
  locales.forEach((l) => {
    alternates[l] = `/${l}/${toolId}`
  })

  return {
    title: meta.title,
    description: meta.description,
    keywords: toolKeywords[toolId] || [],
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
      url: `${siteConfig.url}/${lang}/${toolId}`,
      siteName: siteConfig.name,
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
    alternates: {
      canonical: `/${lang}/${toolId}`,
      languages: alternates,
    },
  }
}
