'use client'

import Link from 'next/link'
import { FileText } from 'lucide-react'
import { siteConfig } from '@/lib/site-config'
import { useDictionary } from '@/lib/i18n/dictionary-context'

export function Footer() {
  const { dict, lang } = useDictionary()
  const toolIds = Object.keys(dict.tool) as (keyof typeof dict.tool)[]

  return (
    <footer className="mt-auto border-t bg-muted/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href={`/${lang}`} className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold">{siteConfig.name}</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              {dict.footer.tagline}
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">{dict.footer.tools}</h3>
            <ul className="space-y-2">
              {toolIds.map((id) => (
                <li key={id}>
                  <Link
                    href={`/${lang}/${id}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {dict.tool[id].name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">{dict.footer.legal}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${lang}/privacy`}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {dict.footer.privacy}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/terms`}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {dict.footer.terms}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">
              {dict.footer.contact}
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:contact@filetools.com"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  contact@filetools.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {siteConfig.name}.{' '}
          {dict.footer.rights}
        </div>
      </div>
    </footer>
  )
}
