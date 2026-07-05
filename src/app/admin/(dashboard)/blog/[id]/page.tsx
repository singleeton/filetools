import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { BlogEditorClient } from '../blog-editor-client'

export const dynamic = 'force-dynamic'

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = await db.blogPost.findUnique({ where: { id } })

  if (!post) notFound()

  return <BlogEditorClient post={JSON.parse(JSON.stringify(post))} />
}
