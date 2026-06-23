'use client'

import { useAdminLang } from './admin-lang-provider'
import { localeNames, localeFlags, type Locale } from '@/lib/i18n/config'
import type { AdminLocale } from '@/lib/i18n/admin-dictionaries'

export function AdminLangSwitcher() {
  const { lang, setLang } = useAdminLang()

  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value as AdminLocale)}
      className="rounded-md border bg-background px-2 py-1.5 text-sm text-foreground"
    >
      {(['en', 'tr', 'ru', 'zh'] as Locale[]).map((l) => (
        <option key={l} value={l}>
          {localeFlags[l]} {localeNames[l]}
        </option>
      ))}
    </select>
  )
}
