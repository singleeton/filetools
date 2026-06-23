'use client'

import { Megaphone } from 'lucide-react'
import { useAdminLang } from '@/components/admin/admin-lang-provider'

export default function AdsPage() {
  const { t } = useAdminLang()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.adManagement}</h1>

      <div className="rounded-xl border bg-card p-12 text-center">
        <Megaphone className="mx-auto h-10 w-10 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Ad Slots</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t.comingSoon}</p>
      </div>
    </div>
  )
}
