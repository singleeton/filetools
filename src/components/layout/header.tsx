'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from './language-switcher'
import { siteConfig } from '@/lib/site-config'
import { useDictionary } from '@/lib/i18n/dictionary-context'

const toolIds = ['pdf-merge', 'pdf-split', 'pdf-compress'] as const

export function Header() {
  const { dict, lang } = useDictionary()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const allToolIds = Object.keys(dict.tool) as (keyof typeof dict.tool)[]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={`/${lang}`} className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">{siteConfig.name}</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href={`/${lang}#tools`}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {dict.nav.tools}
          </Link>
          {toolIds.map((id) => (
            <Link
              key={id}
              href={`/${lang}/${id}`}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {dict.tool[id].name}
            </Link>
          ))}
          <LanguageSwitcher />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t md:hidden">
          <nav className="container mx-auto flex flex-col gap-2 px-4 py-4">
            {allToolIds.map((id) => (
              <Link
                key={id}
                href={`/${lang}/${id}`}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {dict.tool[id].name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
