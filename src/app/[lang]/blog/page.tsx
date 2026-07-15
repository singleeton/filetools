import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { locales, type Locale } from '@/lib/i18n/config'
import { getPublishedPostsPage } from '@/lib/blog'
import type { Metadata } from 'next'

const PAGE_SIZE = 9

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const dict = await getDictionary(lang as Locale)
  const alternates: Record<string, string> = {}
  locales.forEach((l) => { alternates[l] = `/${l}/blog` })

  return {
    title: dict.meta.blog.title,
    description: dict.meta.blog.description,
    alternates: { languages: alternates },
  }
}

export default async function BlogListPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { lang } = await params
  const { page: pageParam } = await searchParams
  const dict = await getDictionary(lang as Locale)
  const page = Math.max(1, parseInt(pageParam || '1', 10) || 1)

  const { posts, total } = await getPublishedPostsPage(lang, page, PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="container mx-auto px-4 py-16 sm:py-20">
      <h1 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
        {dict.blog.listTitle}
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
        {dict.blog.listSubtitle}
      </p>

      {posts.length === 0 ? (
        <p className="mt-12 text-center text-muted-foreground">{dict.blog.emptyState}</p>
      ) : (
        <div className="mx-auto mt-14 max-w-4xl divide-y">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/${lang}/blog/${post.slug}`}
              className="group flex flex-col gap-6 py-10 first:pt-0 sm:flex-row sm:items-center"
            >
              {post.coverImageUrl && (
                <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-2xl sm:w-80">
                  <Image
                    src={post.coverImageUrl}
                    alt={post.title}
                    fill
                    sizes="(min-width: 640px) 320px, 100vw"
                    unoptimized
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                {post.publishedAt && (
                  <span className="text-xs font-medium text-muted-foreground">
                    {new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'long', year: 'numeric' }).format(post.publishedAt)}
                  </span>
                )}
                <h2 className="mt-2 text-xl font-semibold tracking-tight group-hover:text-primary sm:text-2xl">
                  {post.title}
                </h2>
                <p className="mt-3 text-base text-muted-foreground">{post.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  {dict.blog.readMore}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mx-auto mt-4 flex max-w-4xl items-center justify-center gap-4 border-t pt-8">
          {page > 1 && (
            <Link href={`/${lang}/blog?page=${page - 1}`} className="text-sm font-medium text-primary hover:underline">
              ← {dict.blog.previous}
            </Link>
          )}
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          {page < totalPages && (
            <Link href={`/${lang}/blog?page=${page + 1}`} className="text-sm font-medium text-primary hover:underline">
              {dict.blog.next} →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
