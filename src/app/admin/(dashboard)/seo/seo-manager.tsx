'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, Loader2, Plus } from 'lucide-react'

const LOCALES = ['en', 'tr', 'ru', 'zh'] as const
const LOCALE_NAMES: Record<string, string> = { en: 'English', tr: 'Türkçe', ru: 'Русский', zh: '中文' }

const TOOLS = ['pdf-merge', 'pdf-split', 'pdf-compress', 'word-to-pdf', 'pdf-to-word'] as const

interface SeoEntry {
  id?: string
  section: string
  locale: string
  content: string
}

interface SeoContent {
  metaTitle?: string
  metaDescription?: string
  ogTitle?: string
  ogDescription?: string
  canonical?: string
}

export function SeoManager({ initialData }: { initialData: SeoEntry[] }) {
  const [activeLocale, setActiveLocale] = useState<string>('en')
  const [activeTool, setActiveTool] = useState<string>('home')
  const [data, setData] = useState<SeoEntry[]>(initialData)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const currentKey = `seo-${activeTool}`
  const current = data.find((d) => d.section === currentKey && d.locale === activeLocale)
  const parsed: SeoContent = current ? JSON.parse(current.content || '{}') : {}

  const updateField = (field: keyof SeoContent, value: string) => {
    const updated = { ...parsed, [field]: value }
    const json = JSON.stringify(updated)

    setData((prev) => {
      const existing = prev.find((d) => d.section === currentKey && d.locale === activeLocale)
      if (existing) {
        return prev.map((d) =>
          d.section === currentKey && d.locale === activeLocale
            ? { ...d, content: json }
            : d,
        )
      }
      return [...prev, { section: currentKey, locale: activeLocale, content: json }]
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    try {
      const res = await fetch('/api/admin/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: currentKey,
          locale: activeLocale,
          content: JSON.stringify(parsed),
        }),
      })
      setMessage(res.ok ? 'Saved successfully' : 'Save failed')
    } catch {
      setMessage('Network error')
    } finally {
      setSaving(false)
    }
  }

  const pages = [{ id: 'home', label: 'Home Page' }, ...TOOLS.map((t) => ({ id: t, label: t.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ') }))]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">SEO Management</h1>

      {/* Locale tabs */}
      <div className="flex gap-2">
        {LOCALES.map((l) => (
          <button
            key={l}
            onClick={() => setActiveLocale(l)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeLocale === l
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border hover:bg-accent'
            }`}
          >
            {LOCALE_NAMES[l]}
          </button>
        ))}
      </div>

      {/* Page tabs */}
      <div className="flex flex-wrap gap-2">
        {pages.map((p) => (
          <button
            key={p.id}
            onClick={() => setActiveTool(p.id)}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              activeTool === p.id
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-accent'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="max-w-2xl rounded-xl border bg-card p-6 space-y-5">
        <h2 className="font-semibold">
          {pages.find((p) => p.id === activeTool)?.label} — {LOCALE_NAMES[activeLocale]}
        </h2>

        <div className="space-y-2">
          <Label>Meta Title</Label>
          <Input value={parsed.metaTitle || ''} onChange={(e) => updateField('metaTitle', e.target.value)} placeholder="Page title for search engines" />
        </div>

        <div className="space-y-2">
          <Label>Meta Description</Label>
          <Input value={parsed.metaDescription || ''} onChange={(e) => updateField('metaDescription', e.target.value)} placeholder="Page description for search engines" />
        </div>

        <div className="space-y-2">
          <Label>OpenGraph Title</Label>
          <Input value={parsed.ogTitle || ''} onChange={(e) => updateField('ogTitle', e.target.value)} placeholder="Title for social media sharing" />
        </div>

        <div className="space-y-2">
          <Label>OpenGraph Description</Label>
          <Input value={parsed.ogDescription || ''} onChange={(e) => updateField('ogDescription', e.target.value)} placeholder="Description for social media sharing" />
        </div>

        <div className="space-y-2">
          <Label>Canonical URL</Label>
          <Input value={parsed.canonical || ''} onChange={(e) => updateField('canonical', e.target.value)} placeholder="/en/pdf-merge" />
        </div>
      </div>

      {message && (
        <div className={`max-w-2xl rounded-md p-3 text-sm ${message.includes('success') ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
          {message}
        </div>
      )}

      <Button onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Save SEO Settings
      </Button>
    </div>
  )
}
