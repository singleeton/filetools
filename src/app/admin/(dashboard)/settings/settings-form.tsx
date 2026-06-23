'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save } from 'lucide-react'
import { useAdminLang } from '@/components/admin/admin-lang-provider'

export function SettingsForm({
  initialSettings,
}: {
  initialSettings: Record<string, string>
}) {
  const { t } = useAdminLang()
  const [settings, setSettings] = useState(initialSettings)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const settingFields = [
    { key: 'site_name', label: t.siteName, placeholder: 'FileTools' },
    { key: 'site_description', label: t.siteDescription, placeholder: 'Free online file tools' },
    { key: 'contact_email', label: t.contactEmail, placeholder: 'contact@example.com' },
    { key: 'logo_url', label: t.logoUrl, placeholder: '/images/logo.png' },
    { key: 'primary_color', label: t.primaryColor, placeholder: '#2E74B5' },
    { key: 'ga_id', label: t.gaId, placeholder: 'G-XXXXXXXXXX' },
  ]

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      setMessage(res.ok ? t.saved : t.saveFailed)
    } catch {
      setMessage(t.saveFailed)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{t.siteSettings}</h1>

      <div className="rounded-xl border bg-card p-6 space-y-5">
        <h2 className="font-semibold">{t.general}</h2>
        {settingFields.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>{field.label}</Label>
            <Input
              id={field.key}
              value={settings[field.key] || ''}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, [field.key]: e.target.value }))
              }
              placeholder={field.placeholder}
            />
          </div>
        ))}
      </div>

      {message && (
        <div className={`rounded-md p-3 text-sm ${message === t.saved ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
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
