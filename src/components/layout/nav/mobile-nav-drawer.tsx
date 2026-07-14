'use client'

import Link from 'next/link'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, X, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { navCategoryOrder, categoryMeta } from '@/lib/categories'
import { getToolsByCategory } from '@/lib/tools-registry'
import { useDictionary } from '@/lib/i18n/dictionary-context'
import { renderNavIcon } from './tool-nav-icons'

interface MobileNavDrawerProps {
  open: boolean
  onClose: () => void
}

const noopSubscribe = () => () => {}

export function MobileNavDrawer({ open, onClose }: MobileNavDrawerProps) {
  const { dict, lang } = useDictionary()
  const [expanded, setExpanded] = useState<string | null>(null)
  // Portals need `document.body`, which doesn't exist during SSR — this
  // reads true only once mounted on the client, without a setState-in-effect.
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!isClient) return null

  // Rendered via portal: the header uses backdrop-blur, which (like any
  // filter/backdrop-filter/transform) makes it a containing block for
  // `position: fixed` descendants — without the portal this drawer would
  // be clipped to the header's own box instead of covering the viewport.
  return createPortal(
    <div
      className={`fixed inset-0 z-[100] lg:hidden ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
      />
      <div
        className={`absolute top-0 right-0 flex h-full w-full max-w-sm flex-col overflow-y-auto bg-background shadow-2xl transition-transform duration-200 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ willChange: 'transform' }}
      >
        <div className="flex items-center justify-between border-b p-4">
          <span className="text-sm font-semibold">{dict.nav.tools}</span>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1.5 hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 divide-y">
          {navCategoryOrder.map((category) => {
            const meta = categoryMeta[category]
            const catTools = getToolsByCategory(category)
            const isOpen = expanded === category

            return (
              <div key={category}>
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : category)}
                  className="flex w-full items-center justify-between px-4 py-3.5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-2.5">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${meta.gradient} text-white`}>
                      {renderNavIcon(meta.icon, 'h-4 w-4')}
                    </span>
                    <span className="text-sm font-medium">{dict.categories[category].label}</span>
                  </span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="space-y-1 bg-muted/30 px-4 pb-3">
                    {catTools.length === 0 ? (
                      <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {dict.nav.comingSoonTitle}
                      </div>
                    ) : (
                      catTools.map((tool) => (
                        <Link
                          key={tool.id}
                          href={`/${lang}${tool.href}`}
                          onClick={onClose}
                          className="block rounded-md py-2 pl-10.5 text-sm text-muted-foreground hover:text-foreground"
                        >
                          {dict.tool[tool.id as keyof typeof dict.tool]?.name ?? tool.name}
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="space-y-2 border-t p-4">
          <Link href={`/${lang}/login`} onClick={onClose}>
            <Button variant="outline" className="w-full">{dict.nav.signIn}</Button>
          </Link>
          <Link href={`/${lang}/register`} onClick={onClose}>
            <Button className="w-full">{dict.nav.signUp}</Button>
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  )
}
