'use client'

import { useAdminLang } from './admin-lang-provider'
import type { AdminDictionary } from '@/lib/i18n/admin-dictionaries'

export function AdminPageTitle({ titleKey }: { titleKey: keyof AdminDictionary }) {
  const { t } = useAdminLang()
  return <h1 className="text-2xl font-bold">{t[titleKey]}</h1>
}
