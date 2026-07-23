'use client'

import { useEffect } from 'react'
import { useDictionary } from '@/lib/i18n/dictionary-context'

export function SetHtmlLang() {
  const { lang } = useDictionary()
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])
  return null
}
