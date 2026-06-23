'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save } from 'lucide-react'

const settingFields = [
  { key: 'site_name', label: 'Site Name', placeholder: 'FileTools' },
  { key: 'site_description', label: 'Site Description', placeholder: 'Free online file tools' },
  { key: 'contact_email', label: 'Contact Email', placeholder: 'contact@example.com' },
  { key: 'logo_url', label: 'Logo URL', placeholder: '/images/logo.png' },
  { key: 'primary_color', label: 'Primary Color', placeholder: '#2E74B5' },
  { key: 'ga_id', label: 'Google Analytics ID', placeholder: 'G-XXXXXXXXXX' },
]

export function SettingsForm({
  initialSettings,
}: {
  initialSettings: Record<string, string>
}) {
  const [settings, setSettings] = useState(initialSettings)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (res.ok) {
        setMessage('Settings saved successfully')
      } else {
        setMessage('Failed to save settings')
      }
    } catch {
      setMessage('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-xl border bg-card p-6 space-y-5">
        <h2 className="font-semibold">General</h2>

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
        <div className={`rounded-md p-3 text-sm ${message.includes('success') ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
          {message}
        </div>
      )}

      <Button onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Save Settings
      </Button>
    </div>
  )
}
