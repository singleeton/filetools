'use client'

import { useEffect } from 'react'
import { useDictionary } from '@/lib/i18n/dictionary-context'
import type { Locale } from '@/lib/i18n/config'

/**
 * Registers per-locale URLs for the current page so the LanguageSwitcher can
 * jump straight to the correct translation instead of guessing via a naive
 * `/[lang]/...` segment swap (which 404s when the slug differs per locale).
 */
export function LocaleAlternatesSync({ alternates }: { alternates: Partial<Record<Locale, string>> }) {
  const { setLocaleAlternates } = useDictionary()

  useEffect(() => {
    setLocaleAlternates(alternates)
    return () => setLocaleAlternates(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(alternates)])

  return null
}
