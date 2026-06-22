'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Globe } from 'lucide-react'
import { locales, localeNames, localeFlags, type Locale } from '@/lib/i18n/config'
import { useDictionary } from '@/lib/i18n/dictionary-context'

export function LanguageSwitcher() {
  const { lang } = useDictionary()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function getLocalizedPath(locale: Locale) {
    const segments = pathname.split('/')
    segments[1] = locale
    return segments.join('/')
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{localeNames[lang]}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-lg border bg-popover p-1 shadow-md">
          {locales.map((locale) => (
            <a
              key={locale}
              href={getLocalizedPath(locale)}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent ${
                locale === lang
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              <span>{localeFlags[locale]}</span>
              <span>{localeNames[locale]}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
