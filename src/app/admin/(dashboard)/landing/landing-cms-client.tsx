'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, Loader2, Plus, Trash2 } from 'lucide-react'
import { useAdminLang } from '@/components/admin/admin-lang-provider'
import { ImageUploadField } from '@/components/admin/image-upload-field'

const LOCALES = ['en', 'tr', 'ru', 'zh'] as const
const LOCALE_NAMES: Record<string, string> = { en: 'English', tr: 'Türkçe', ru: 'Русский', zh: '中文' }

const SECTIONS = [
  { id: 'hero', label: 'Hero Section', fields: ['title', 'subtitle', 'cta'], imageFields: ['heroImage'] },
  { id: 'features', label: 'Features', fields: ['title', 'subtitle'] },
  { id: 'feature_1', label: 'Feature 1', fields: ['title', 'description'], imageFields: ['image'] },
  { id: 'feature_2', label: 'Feature 2', fields: ['title', 'description'], imageFields: ['image'] },
  { id: 'feature_3', label: 'Feature 3', fields: ['title', 'description'], imageFields: ['image'] },
  { id: 'feature_4', label: 'Feature 4', fields: ['title', 'description'], imageFields: ['image'] },
  { id: 'howItWorks', label: 'How It Works', fields: ['title', 'subtitle'] },
  { id: 'step_1', label: 'Step 1', fields: ['title', 'description'] },
  { id: 'step_2', label: 'Step 2', fields: ['title', 'description'] },
  { id: 'step_3', label: 'Step 3', fields: ['title', 'description'] },
  { id: 'trust', label: 'Trust Section', fields: ['title', 'subtitle'] },
  { id: 'trust_1', label: 'Trust 1', fields: ['title', 'description'] },
  { id: 'trust_2', label: 'Trust 2', fields: ['title', 'description'] },
  { id: 'trust_3', label: 'Trust 3', fields: ['title', 'description'] },
  { id: 'cta', label: 'CTA Section', fields: ['title', 'subtitle', 'button'] },
  { id: 'faq', label: 'FAQ', fields: [] },
] as const

interface ContentEntry {
  id?: string
  section: string
  locale: string
  content: string
}

export function LandingCmsClient({ initialContent }: { initialContent: ContentEntry[] }) {
  const [activeLocale, setActiveLocale] = useState<string>('en')
  const [activeSection, setActiveSection] = useState<string>('hero')
  const [data, setData] = useState<ContentEntry[]>(initialContent)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const { t } = useAdminLang()

  const sectionConfig = SECTIONS.find((s) => s.id === activeSection)!
  const currentEntry = data.find((d) => d.section === activeSection && d.locale === activeLocale)
  const parsed: Record<string, string | { question: string; answer: string }[]> = currentEntry
    ? JSON.parse(currentEntry.content || '{}')
    : {}

  const updateField = (field: string, value: string) => {
    const updated = { ...parsed, [field]: value }
    const json = JSON.stringify(updated)
    setData((prev) => {
      const existing = prev.find((d) => d.section === activeSection && d.locale === activeLocale)
      if (existing) {
        return prev.map((d) =>
          d.section === activeSection && d.locale === activeLocale ? { ...d, content: json } : d,
        )
      }
      return [...prev, { section: activeSection, locale: activeLocale, content: json }]
    })
  }

  const getFaqItems = (): { question: string; answer: string }[] => {
    const items = parsed.items
    if (Array.isArray(items)) return items as { question: string; answer: string }[]
    return []
  }

  const updateFaq = (items: { question: string; answer: string }[]) => {
    const updated = { ...parsed, items }
    const json = JSON.stringify(updated)
    setData((prev) => {
      const existing = prev.find((d) => d.section === activeSection && d.locale === activeLocale)
      if (existing) {
        return prev.map((d) =>
          d.section === activeSection && d.locale === activeLocale ? { ...d, content: json } : d,
        )
      }
      return [...prev, { section: activeSection, locale: activeLocale, content: json }]
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const content = data.find((d) => d.section === activeSection && d.locale === activeLocale)?.content || '{}'
      const res = await fetch('/api/admin/landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: activeSection, locale: activeLocale, content }),
      })
      setMessage(res.ok ? t.saved : t.saveFailed)
    } catch {
      setMessage(t.saveFailed)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.landing} CMS</h1>

      {/* Locale tabs */}
      <div className="flex gap-2">
        {LOCALES.map((l) => (
          <button key={l} onClick={() => setActiveLocale(l)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${activeLocale === l ? 'bg-primary text-primary-foreground' : 'bg-card border hover:bg-accent'}`}>
            {LOCALE_NAMES[l]}
          </button>
        ))}
      </div>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${activeSection === s.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-accent'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="max-w-2xl rounded-xl border bg-card p-6 space-y-5">
        <h2 className="font-semibold">{sectionConfig.label} — {LOCALE_NAMES[activeLocale]}</h2>

        {activeSection === 'faq' ? (
          <FaqEditor items={getFaqItems()} onChange={updateFaq} />
        ) : (
          <>
            {sectionConfig.fields.map((field) => (
              <div key={field} className="space-y-2">
                <Label className="capitalize">{field}</Label>
                <Input
                  value={(parsed[field] as string) || ''}
                  onChange={(e) => updateField(field, e.target.value)}
                  placeholder={field}
                />
              </div>
            ))}
            {'imageFields' in sectionConfig &&
              sectionConfig.imageFields.map((field) => (
                <ImageUploadField
                  key={field}
                  label={field === 'heroImage' ? 'Hero image' : 'Image'}
                  value={(parsed[field] as string) || ''}
                  onChange={(url) => updateField(field, url)}
                />
              ))}
          </>
        )}
      </div>

      {message && (
        <div className={`max-w-2xl rounded-md p-3 text-sm ${message === t.saved ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
          {message}
        </div>
      )}

      <Button onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        {t.save}
      </Button>
    </div>
  )
}

function FaqEditor({
  items,
  onChange,
}: {
  items: { question: string; answer: string }[]
  onChange: (items: { question: string; answer: string }[]) => void
}) {
  const addItem = () => {
    onChange([...items, { question: '', answer: '' }])
  }

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: 'question' | 'answer', value: string) => {
    onChange(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="space-y-2 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <Label>FAQ #{i + 1}</Label>
            <button onClick={() => removeItem(i)} className="text-destructive hover:text-destructive/80">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <Input
            value={item.question}
            onChange={(e) => updateItem(i, 'question', e.target.value)}
            placeholder="Question"
          />
          <Input
            value={item.answer}
            onChange={(e) => updateItem(i, 'answer', e.target.value)}
            placeholder="Answer"
          />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addItem}>
        <Plus className="mr-1 h-3 w-3" /> Add FAQ
      </Button>
    </div>
  )
}
