import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { locales, type Locale } from '@/lib/i18n/config'
import { getPublishedPostBySlug, getPublishedSiblingsByTranslationKey } from '@/lib/blog'
import { BlogPostStructuredData } from '@/components/shared/structured-data'
import { LocaleAlternatesSync } from '@/components/shared/locale-alternates-sync'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { lang, slug } = await params
  const post = await getPublishedPostBySlug(lang, slug)

  if (!post) return {}

  const languages: Record<string, string> = { [lang]: `/${lang}/blog/${slug}` }
  if (post.translationKey) {
    const siblings = await getPublishedSiblingsByTranslationKey(post.translationKey)
    for (const sibling of siblings) {
      if (locales.includes(sibling.locale as Locale)) {
        languages[sibling.locale] = `/${sibling.locale}/blog/${sibling.slug}`
      }
    }
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    alternates: {
      canonical: `/${lang}/blog/${slug}`,
      languages,
    },
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  const dict = await getDictionary(lang as Locale)
  const post = await getPublishedPostBySlug(lang, slug)

  if (!post) notFound()

  const alternates: Partial<Record<Locale, string>> = { [lang as Locale]: `/${lang}/blog/${slug}` }
  if (post.translationKey) {
    const siblings = await getPublishedSiblingsByTranslationKey(post.translationKey)
    for (const sibling of siblings) {
      if (locales.includes(sibling.locale as Locale)) {
        alternates[sibling.locale as Locale] = `/${sibling.locale}/blog/${sibling.slug}`
      }
    }
  }

  return (
    <article className="container mx-auto max-w-3xl px-4 py-16 sm:py-20">
      <LocaleAlternatesSync alternates={alternates} />
      <BlogPostStructuredData
        title={post.title}
        description={post.metaDescription || post.excerpt}
        url={`/${lang}/blog/${slug}`}
        image={post.coverImageUrl}
        datePublished={(post.publishedAt || post.createdAt).toISOString()}
        dateModified={post.updatedAt.toISOString()}
      />

      <Link href={`/${lang}/blog`} className="text-sm font-medium text-primary hover:underline">
        ← {dict.blog.backToBlog}
      </Link>

      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
      {post.publishedAt && (
        <p className="mt-2 text-sm text-muted-foreground">
          {dict.blog.publishedOn} {post.publishedAt.toLocaleDateString(lang)}
        </p>
      )}

      {post.coverImageUrl && (
        <Image
          src={post.coverImageUrl}
          alt={post.title}
          width={800}
          height={420}
          unoptimized
          className="mt-8 w-full rounded-xl border object-cover"
        />
      )}

      <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>
    </article>
  )
}
