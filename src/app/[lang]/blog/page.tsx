import Link from 'next/link'
import Image from 'next/image'
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
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/${lang}/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:border-primary/50 hover:shadow-md"
            >
              {post.coverImageUrl && (
                <Image
                  src={post.coverImageUrl}
                  alt={post.title}
                  width={400}
                  height={220}
                  unoptimized
                  className="h-40 w-full object-cover"
                />
              )}
              <div className="flex flex-1 flex-col p-5">
                <h2 className="font-semibold group-hover:text-primary">{post.title}</h2>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
                <span className="mt-4 text-sm font-medium text-primary">
                  {dict.blog.readMore} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mx-auto mt-12 flex max-w-5xl items-center justify-center gap-4">
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
