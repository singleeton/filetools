'use client'

import { createContext, useContext, useCallback, useState } from 'react'
import type { Dictionary } from './dictionaries/en'
import type { Locale } from './config'

interface DictionaryContextValue {
  dict: Dictionary
  lang: Locale
  /**
   * Swaps the active dictionary/locale in place, without a Next.js
   * navigation — used by LanguageSwitcher so switching language doesn't
   * remount the `[lang]` segment (and wipe whatever the user was doing on
   * the current page). See language-switcher.tsx.
   */
  setDictionary: (dict: Dictionary, lang: Locale) => void
  /**
   * Per-locale URLs for the current page, when the path can't be derived by
   * swapping the `/[lang]/...` segment (e.g. a blog post whose slug differs
   * per translation). Set by the page via LocaleAlternatesSync; null means
   * "use the naive segment swap".
   */
  localeAlternates: Partial<Record<Locale, string>> | null
  setLocaleAlternates: (alternates: Partial<Record<Locale, string>> | null) => void
  /**
   * True on pages whose body text is rendered server-side from props (not
   * `useDictionary()`), e.g. the home page and the tools listing — set via
   * DisableSoftLocaleSwitch. LanguageSwitcher falls back to a real
   * navigation there, since an in-place dictionary swap wouldn't retranslate
   * that content.
   */
  softSwitchDisabled: boolean
  setSoftSwitchDisabled: (disabled: boolean) => void
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
  const [state, setState] = useState({ dict: dictionary, lang })
  const [localeAlternates, setLocaleAlternates] = useState<Partial<Record<Locale, string>> | null>(null)
  const [softSwitchDisabled, setSoftSwitchDisabled] = useState(false)

  const setDictionary = useCallback((dict: Dictionary, nextLang: Locale) => {
    setState({ dict, lang: nextLang })
  }, [])

  return (
    <DictionaryContext.Provider
      value={{
        dict: state.dict,
        lang: state.lang,
        setDictionary,
        localeAlternates,
        setLocaleAlternates,
        softSwitchDisabled,
        setSoftSwitchDisabled,
      }}
    >
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
