import { db } from './db'

export async function getLatestPublishedPosts(locale: string, limit: number) {
  return db.blogPost.findMany({
    where: { locale, status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  })
}

export async function getPublishedPostsPage(locale: string, page: number, pageSize: number) {
  const where = { locale, status: 'PUBLISHED' as const }
  const [posts, total] = await Promise.all([
    db.blogPost.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.blogPost.count({ where }),
  ])
  return { posts, total }
}

export async function getPublishedPostBySlug(locale: string, slug: string) {
  return db.blogPost.findFirst({
    where: { locale, slug, status: 'PUBLISHED' },
  })
}

export async function getPublishedSiblingsByTranslationKey(translationKey: string) {
  return db.blogPost.findMany({
    where: { translationKey, status: 'PUBLISHED' },
  })
}

export async function getPublishedPostsForSitemap() {
  return db.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    select: { locale: true, slug: true, updatedAt: true },
  })
}
