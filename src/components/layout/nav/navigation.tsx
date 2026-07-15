'use client'

import Link from 'next/link'
import { navCategoryOrder } from '@/lib/categories'
import { useDictionary } from '@/lib/i18n/dictionary-context'
import { NavDropdown } from './nav-dropdown'
import { CategoryMegaMenu } from './category-mega-menu'
import { ToolsMegaMenu } from './tools-mega-menu'

/** Desktop nav bar: one hover-mega-menu per category, plus the Tools and Blog links. */
export function Navigation() {
  const { dict, lang } = useDictionary()

  const midpoint = Math.ceil(navCategoryOrder.length / 2)

  return (
    <nav className="hidden items-center gap-5 lg:flex">
      {navCategoryOrder.map((category, i) => (
        <NavDropdown key={category} label={dict.categories[category].label} align={i < midpoint ? 'left' : 'right'}>
          {(close) => <CategoryMegaMenu category={category} onNavigate={close} />}
        </NavDropdown>
      ))}

      <NavDropdown label={dict.nav.tools} href={`/${lang}/tools`} align="right">
        {(close) => <ToolsMegaMenu onNavigate={close} />}
      </NavDropdown>

      <Link
        href={`/${lang}/blog`}
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {dict.blog.nav}
      </Link>
    </nav>
  )
}
