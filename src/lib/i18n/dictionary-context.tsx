'use client'

import { createContext, useContext, useState } from 'react'
import type { Dictionary } from './dictionaries/en'
import type { Locale } from './config'

interface DictionaryContextValue {
  dict: Dictionary
  lang: Locale
  /**
   * Per-locale URLs for the current page, when the path can't be derived by
   * swapping the `/[lang]/...` segment (e.g. a blog post whose slug differs
   * per translation). Set by the page via LocaleAlternatesSync; null means
   * "use the naive segment swap".
   */
  localeAlternates: Partial<Record<Locale, string>> | null
  setLocaleAlternates: (alternates: Partial<Record<Locale, string>> | null) => void
}

const DictionaryContext = createContext<DictionaryContextValue | null>(null)

export function DictionaryProvider({
  dictionary,
  lang,
  children,
}: {
  dictionary: Dictionary
  lang: Locale
  children: React.ReactNode
}) {
  const [localeAlternates, setLocaleAlternates] = useState<Partial<Record<Locale, string>> | null>(null)

  return (
    <DictionaryContext.Provider value={{ dict: dictionary, lang, localeAlternates, setLocaleAlternates }}>
      {children}
    </DictionaryContext.Provider>
  )
}

export function useDictionary(): DictionaryContextValue {
  const ctx = useContext(DictionaryContext)
  if (!ctx) {
    throw new Error('useDictionary must be used within DictionaryProvider')
  }
  return ctx
}
