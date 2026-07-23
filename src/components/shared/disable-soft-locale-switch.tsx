'use client'

import { useEffect } from 'react'
import { useDictionary } from '@/lib/i18n/dictionary-context'

/**
 * Marks the current page as ineligible for LanguageSwitcher's in-place
 * dictionary swap — for pages whose body text is rendered server-side from
 * props (not `useDictionary()`), e.g. the home page and the tools listing.
 * Without this, switching language would update the header/nav but leave
 * the page body in the old language until a real navigation happens.
 */
export function DisableSoftLocaleSwitch() {
  const { setSoftSwitchDisabled } = useDictionary()

  useEffect(() => {
    setSoftSwitchDisabled(true)
    return () => setSoftSwitchDisabled(false)
  }, [setSoftSwitchDisabled])

  return null
}
