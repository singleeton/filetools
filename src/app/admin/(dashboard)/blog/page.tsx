import { db } from '@/lib/db'
import { BlogListClient } from './blog-list-client'

export const dynamic = 'force-dynamic'

export default async function AdminBlogPage() {
  const posts = await db.blogPost.findMany({ orderBy: { createdAt: 'desc' } })
  return <BlogListClient initialPosts={JSON.parse(JSON.stringify(posts))} />
}
