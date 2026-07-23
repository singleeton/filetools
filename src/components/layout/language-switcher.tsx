'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Globe } from 'lucide-react'
import { locales, localeNames, localeFlags, type Locale } from '@/lib/i18n/config'
import { useDictionary } from '@/lib/i18n/dictionary-context'

export function LanguageSwitcher() {
  const { lang, localeAlternates, softSwitchDisabled, setDictionary } = useDictionary()
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
    // Pages whose URL can't be derived by swapping the lang segment (e.g. a
    // blog post with a per-locale slug) register their own mapping; fall
    // back to the blog index rather than guessing a slug that may 404.
    if (localeAlternates) {
      return localeAlternates[locale] ?? `/${locale}/blog`
    }
    const segments = pathname.split('/')
    segments[1] = locale
    return segments.join('/')
  }

  // Switching `[lang]` is a real Next.js navigation (different route
  // segment value), which remounts everything below it — wiping whatever
  // the user was doing on the current page (uploaded file, drawn signature,
  // half-filled form, etc). For pages whose content is purely
  // dictionary-driven (i.e. `localeAlternates` is null — every tool page,
  // home, tools listing, auth pages) we swap the dictionary in place
  // instead, so the page never remounts. Pages with real per-locale server
  // content (blog, where `localeAlternates` is set) still do a normal
  // navigation, since a client-side swap can't refetch that.
  async function handleClick(e: React.MouseEvent, locale: Locale, href: string) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    if (localeAlternates || softSwitchDisabled) return
    if (locale === lang) {
      setOpen(false)
      return
    }

    e.preventDefault()
    setOpen(false)

    try {
      const res = await fetch(`/api/dictionary/${locale}`)
      if (!res.ok) throw new Error('Failed to load dictionary')
      const { dict } = await res.json()
      setDictionary(dict, locale)
      window.history.pushState(null, '', href)
    } catch {
      window.location.assign(href)
    }
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
          {locales.map((locale) => {
            const href = getLocalizedPath(locale)
            return (
              <Link
                key={locale}
                href={href}
                onClick={(e) => handleClick(e, locale, href)}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent ${
                  locale === lang
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                <span>{localeFlags[locale]}</span>
                <span>{localeNames[locale]}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
