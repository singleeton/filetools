'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Sparkles, Pencil } from 'lucide-react'
import { useAdminLang } from '@/components/admin/admin-lang-provider'

interface Post {
  id: string
  slug: string
  locale: string
  title: string
  status: 'DRAFT' | 'PUBLISHED'
  aiGenerated: boolean
  createdAt: string
  publishedAt: string | null
}

const LOCALES = ['all', 'en', 'tr', 'ru', 'zh'] as const
const LOCALE_NAMES: Record<string, string> = { all: 'All', en: 'English', tr: 'Türkçe', ru: 'Русский', zh: '中文' }

export function BlogListClient({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts)
  const [localeFilter, setLocaleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { t } = useAdminLang()

  const filtered = posts.filter(
    (p) =>
      (localeFilter === 'all' || p.locale === localeFilter) &&
      (statusFilter === 'all' || p.status === statusFilter),
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return
    const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blog</h1>
        <Link href="/admin/blog/new">
          <Button size="sm">
            <Plus className="mr-1 h-3.5 w-3.5" /> New Post
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          {LOCALES.map((l) => (
            <button
              key={l}
              onClick={() => setLocaleFilter(l)}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${localeFilter === l ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-accent'}`}
            >
              {LOCALE_NAMES[l]}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['all', 'DRAFT', 'PUBLISHED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${statusFilter === s ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-accent'}`}
            >
              {s === 'all' ? 'All statuses' : s === 'DRAFT' ? 'Draft' : 'Published'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">No posts found.</p>
        )}
        {filtered.map((post) => (
          <div key={post.id} className="flex items-center justify-between rounded-xl border bg-card p-5">
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  post.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'
                }`}
              >
                {post.status === 'PUBLISHED' ? 'Published' : 'Draft'}
              </span>
              <div>
                <p className="flex items-center gap-1.5 font-medium">
                  {post.aiGenerated && <Sparkles className="h-3.5 w-3.5 text-primary" />}
                  {post.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {LOCALE_NAMES[post.locale] || post.locale} • /{post.slug}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/admin/blog/${post.id}`}>
                <Button size="sm" variant="ghost">
                  <Pencil className="mr-1 h-3 w-3" /> {t.edit}
                </Button>
              </Link>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(post.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
