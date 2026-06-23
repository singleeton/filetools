'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, Loader2, Check, X } from 'lucide-react'
import { useAdminLang } from '@/components/admin/admin-lang-provider'

interface AdSlotData {
  id: string
  name: string
  label: string
  code: string | null
  isActive: boolean
}

export function AdsClient({ slots: initialSlots }: { slots: AdSlotData[] }) {
  const [slots, setSlots] = useState(initialSlots)
  const [saving, setSaving] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const { t } = useAdminLang()

  const updateSlot = (name: string, field: string, value: string | boolean) => {
    setSlots((prev) =>
      prev.map((s) => (s.name === name ? { ...s, [field]: value } : s)),
    )
  }

  const saveSlot = async (slot: AdSlotData) => {
    setSaving(slot.name)
    setMessage('')
    try {
      const res = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slot),
      })
      if (res.ok) {
        const data = await res.json()
        setSlots((prev) => prev.map((s) => (s.name === slot.name ? data.slot : s)))
        setMessage(t.saved)
      } else {
        setMessage(t.saveFailed)
      }
    } catch {
      setMessage(t.saveFailed)
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.adManagement}</h1>

      <p className="text-sm text-muted-foreground">
        Paste your ad code (Google AdSense, custom HTML/JS) into each slot. Toggle active/inactive to show or hide ads.
      </p>

      {message && (
        <div className={`rounded-md p-3 text-sm ${message === t.saved ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        {slots.map((slot) => (
          <div key={slot.name} className="rounded-xl border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    updateSlot(slot.name, 'isActive', !slot.isActive)
                  }}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                    slot.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}
                >
                  {slot.isActive ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </button>
                <div>
                  <p className="font-medium">{slot.label}</p>
                  <p className="text-xs text-muted-foreground">{slot.name}</p>
                </div>
              </div>
              <Button size="sm" onClick={() => saveSlot(slot)} disabled={saving === slot.name}>
                {saving === slot.name ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Save className="mr-1 h-3 w-3" />}
                {t.save}
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Ad Code (HTML/JS)</Label>
              <textarea
                value={slot.code || ''}
                onChange={(e) => updateSlot(slot.name, 'code', e.target.value)}
                placeholder={'<!-- Paste AdSense or custom ad code here -->\n<script async src="..."></script>\n<ins class="adsbygoogle" ...></ins>'}
                className="w-full rounded-lg border bg-background p-3 text-sm font-mono min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
