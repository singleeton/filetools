'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, FileText, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from './language-switcher'
import { ThemeToggle } from './theme-toggle'
import { Navigation } from './nav/navigation'
import { MobileNavDrawer } from './nav/mobile-nav-drawer'
import { siteConfig } from '@/lib/site-config'
import { useDictionary } from '@/lib/i18n/dictionary-context'

export function Header() {
  const { dict, lang } = useDictionary()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<{ name: string } | null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => setUser(d.user)).catch(() => {})
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link href={`/${lang}`} className="flex shrink-0 items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">{siteConfig.name}</span>
        </Link>

        <Navigation />

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <LanguageSwitcher />
          {user ? (
            <Link href={`/${lang}/profile`} className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
              <User className="h-4 w-4" />
              <span>{user.name}</span>
            </Link>
          ) : (
            <>
              <Link href={`/${lang}/login`}>
                <Button size="sm" variant="outline">{dict.nav.signIn}</Button>
              </Link>
              <Link href={`/${lang}/register`}>
                <Button size="sm">{dict.nav.signUp}</Button>
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <LanguageSwitcher />
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)} aria-label="Menu">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <MobileNavDrawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  )
}
