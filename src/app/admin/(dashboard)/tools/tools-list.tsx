'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, X, Pencil, Save, Loader2 } from 'lucide-react'

interface ToolData {
  id: string
  slug: string
  name: string
  description: string
  category: string
  icon: string
  isActive: boolean
  isPremium: boolean
  sortOrder: number
  maxFileSize: number
  config: string | null
}

export function ToolsList({ tools: initialTools }: { tools: ToolData[] }) {
  const [tools, setTools] = useState(initialTools)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<ToolData>>({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const startEdit = (tool: ToolData) => {
    setEditingId(tool.id)
    setEditData({ ...tool })
    setMessage('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditData({})
  }

  const saveEdit = async () => {
    if (!editingId) return
    setSaving(true)
    setMessage('')

    try {
      const res = await fetch(`/api/admin/tools/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })

      if (res.ok) {
        const updated = await res.json()
        setTools((prev) => prev.map((t) => (t.id === editingId ? updated.tool : t)))
        setEditingId(null)
        setMessage('Saved')
      } else {
        setMessage('Save failed')
      }
    } catch {
      setMessage('Network error')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (tool: ToolData) => {
    const res = await fetch(`/api/admin/tools/${tool.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !tool.isActive }),
    })
    if (res.ok) {
      const updated = await res.json()
      setTools((prev) => prev.map((t) => (t.id === tool.id ? updated.tool : t)))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tools Management</h1>
        <span className="text-sm text-muted-foreground">{tools.length} tools</span>
      </div>

      {message && (
        <div className={`rounded-md p-3 text-sm ${message === 'Saved' ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
          {message}
        </div>
      )}

      <div className="space-y-3">
        {tools.map((tool) => (
          <div key={tool.id} className="rounded-xl border bg-card">
            {editingId === tool.id ? (
              <div className="p-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={editData.name || ''} onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input value={editData.slug || ''} disabled className="opacity-60" />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input value={editData.category || ''} onChange={(e) => setEditData((d) => ({ ...d, category: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <Input value={editData.icon || ''} onChange={(e) => setEditData((d) => ({ ...d, icon: e.target.value }))} />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label>Description</Label>
                    <Input value={editData.description || ''} onChange={(e) => setEditData((d) => ({ ...d, description: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Sort Order</Label>
                    <Input type="number" value={editData.sortOrder || 0} onChange={(e) => setEditData((d) => ({ ...d, sortOrder: parseInt(e.target.value) || 0 }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Max File Size (bytes)</Label>
                    <Input type="number" value={editData.maxFileSize || 0} onChange={(e) => setEditData((d) => ({ ...d, maxFileSize: parseInt(e.target.value) || 0 }))} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveEdit} disabled={saving}>
                    {saving ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Save className="mr-1 h-3 w-3" />}
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleActive(tool)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                      tool.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}
                  >
                    {tool.isActive ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  </button>
                  <div>
                    <p className="font-medium">{tool.name}</p>
                    <p className="text-xs text-muted-foreground">/{tool.slug} • {tool.category} • Sort: {tool.sortOrder}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => startEdit(tool)}>
                  <Pencil className="mr-1 h-3 w-3" /> Edit
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
