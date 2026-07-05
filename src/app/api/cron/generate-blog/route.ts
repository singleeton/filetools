import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { BlogAiService } from '@/lib/blog-ai/service'

async function ensureUniqueSlug(baseSlug: string, locale: string): Promise<string> {
  let slug = baseSlug
  let suffix = 2
  while (await db.blogPost.findUnique({ where: { slug_locale: { slug, locale } } })) {
    slug = `${baseSlug}-${suffix}`
    suffix += 1
  }
  return slug
}

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const drafts = await BlogAiService.generateDailyDrafts()

  const created: string[] = []
  for (const draft of drafts) {
    const slug = await ensureUniqueSlug(draft.result.slug, draft.locale)
    const post = await db.blogPost.create({
      data: {
        slug,
        locale: draft.locale,
        title: draft.result.title,
        excerpt: draft.result.excerpt,
        content: draft.result.content,
        metaDescription: draft.result.metaDescription,
        status: 'DRAFT',
        aiGenerated: true,
        translationKey: draft.translationKey,
      },
    })
    created.push(post.id)
  }

  return NextResponse.json({ success: true, created: created.length })
}
