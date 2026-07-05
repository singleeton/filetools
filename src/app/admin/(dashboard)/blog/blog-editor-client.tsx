'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ImageUploadField } from '@/components/admin/image-upload-field'
import { Save, Loader2, Eye, Pencil as PencilIcon, Rocket, Undo2 } from 'lucide-react'

const LOCALES = ['en', 'tr', 'ru', 'zh'] as const
const LOCALE_NAMES: Record<string, string> = { en: 'English', tr: 'Türkçe', ru: 'Русский', zh: '中文' }

export interface BlogPostData {
  id: string
  slug: string
  locale: string
  title: string
  excerpt: string
  content: string
  coverImageUrl: string | null
  metaTitle: string | null
  metaDescription: string | null
  status: 'DRAFT' | 'PUBLISHED'
}

export function BlogEditorClient({ post }: { post?: BlogPostData }) {
  const router = useRouter()
  const isNew = !post

  const [form, setForm] = useState({
    slug: post?.slug || '',
    locale: post?.locale || 'en',
    title: post?.title || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    coverImageUrl: post?.coverImageUrl || '',
    metaTitle: post?.metaTitle || '',
    metaDescription: post?.metaDescription || '',
  })
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>(post?.status || 'DRAFT')
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [message, setMessage] = useState('')

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const slugify = () => {
    const slug = form.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    update('slug', slug)
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      if (isNew) {
        const res = await fetch('/api/admin/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, status }),
        })
        const data = await res.json()
        if (res.ok) {
          router.push(`/admin/blog/${data.post.id}`)
          return
        }
        setMessage(data.error || 'Failed to save')
      } else {
        const res = await fetch(`/api/admin/blog/${post!.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        setMessage(res.ok ? 'Saved' : 'Failed to save')
      }
    } catch {
      setMessage('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const togglePublish = async () => {
    if (isNew) {
      setMessage('Save the post first')
      return
    }
    setPublishing(true)
    setMessage('')
    const nextStatus = status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
    try {
      const res = await fetch(`/api/admin/blog/${post!.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (res.ok) {
        setStatus(nextStatus)
        setMessage(nextStatus === 'PUBLISHED' ? 'Published' : 'Unpublished')
      } else {
        setMessage('Failed to update status')
      }
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{isNew ? 'New Post' : 'Edit Post'}</h1>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            status === 'PUBLISHED' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'
          }`}
        >
          {status === 'PUBLISHED' ? 'Published' : 'Draft'}
        </span>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Locale</Label>
            <select
              value={form.locale}
              onChange={(e) => update('locale', e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
            >
              {LOCALES.map((l) => (
                <option key={l} value={l}>{LOCALE_NAMES[l]}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <div className="flex gap-2">
              <Input value={form.slug} onChange={(e) => update('slug', e.target.value)} placeholder="my-post-slug" />
              <Button type="button" variant="outline" size="sm" onClick={slugify}>From title</Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={form.title} onChange={(e) => update('title', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Excerpt</Label>
          <Textarea rows={2} value={form.excerpt} onChange={(e) => update('excerpt', e.target.value)} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Content (Markdown)</Label>
            <Button type="button" variant="ghost" size="sm" onClick={() => setPreview((p) => !p)}>
              {preview ? <PencilIcon className="mr-1 h-3.5 w-3.5" /> : <Eye className="mr-1 h-3.5 w-3.5" />}
              {preview ? 'Edit' : 'Preview'}
            </Button>
          </div>
          {preview ? (
            <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg border p-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content}</ReactMarkdown>
            </div>
          ) : (
            <Textarea rows={14} value={form.content} onChange={(e) => update('content', e.target.value)} className="font-mono text-sm" />
          )}
        </div>

        <ImageUploadField
          label="Cover image"
          value={form.coverImageUrl}
          onChange={(url) => update('coverImageUrl', url)}
        />

        <div className="space-y-2">
          <Label>Meta title</Label>
          <Input value={form.metaTitle} onChange={(e) => update('metaTitle', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Meta description</Label>
          <Textarea rows={2} value={form.metaDescription} onChange={(e) => update('metaDescription', e.target.value)} />
        </div>
      </div>

      {message && (
        <div className="rounded-md bg-muted p-3 text-sm">{message}</div>
      )}

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save
        </Button>
        {!isNew && (
          <Button onClick={togglePublish} disabled={publishing} variant={status === 'PUBLISHED' ? 'outline' : 'default'}>
            {publishing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : status === 'PUBLISHED' ? (
              <Undo2 className="mr-2 h-4 w-4" />
            ) : (
              <Rocket className="mr-2 h-4 w-4" />
            )}
            {status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
          </Button>
        )}
      </div>
    </div>
  )
}
