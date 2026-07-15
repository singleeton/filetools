'use client'

import Link from 'next/link'
import { Clock } from 'lucide-react'
import type { ToolCategory } from '@/types/tool'
import { categoryMeta } from '@/lib/categories'
import { getToolsByCategory } from '@/lib/tools-registry'
import { useDictionary } from '@/lib/i18n/dictionary-context'
import { MegaMenuCard } from './mega-menu-card'
import { FeaturedToolCard } from './featured-tool-card'
import { renderNavIcon } from './tool-nav-icons'

interface CategoryMegaMenuProps {
  category: ToolCategory
  onNavigate: () => void
}

export function CategoryMegaMenu({ category, onNavigate }: CategoryMegaMenuProps) {
  const { dict, lang } = useDictionary()
  const meta = categoryMeta[category]
  const categoryDict = dict.categories[category]
  const catTools = getToolsByCategory(category)

  if (catTools.length === 0) {
    return (
      <div className="flex w-[380px] flex-col items-center gap-3 px-8 py-10 text-center">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${meta.gradient} text-white`}>
          <Clock className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold">{dict.nav.comingSoonTitle}</h3>
        <p className="text-sm text-muted-foreground">{dict.nav.comingSoonDesc}</p>
      </div>
    )
  }

  const featured = catTools.length > 1 ? (catTools.find((t) => t.isPopular) ?? catTools[0]) : null

  return (
    <div className="w-[760px] p-5">
      <div className="grid grid-cols-[170px_minmax(0,1fr)] gap-6">
        <div className="border-r pr-5">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${meta.gradient} text-white`}>
            {renderNavIcon(meta.icon, 'h-5 w-5')}
          </div>
          <h3 className="mt-3 text-sm font-semibold text-foreground">{categoryDict.label}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{categoryDict.tagline}</p>
        </div>

        <div className={`grid gap-x-5 ${featured ? 'grid-cols-[minmax(0,1fr)_200px]' : 'grid-cols-1'}`}>
          <div className="grid min-w-0 content-start gap-x-3">
            {catTools.map((tool) => (
              <MegaMenuCard
                key={tool.id}
                lang={lang}
                tool={tool}
                name={dict.tool[tool.id as keyof typeof dict.tool]?.name ?? tool.name}
                description={dict.tool[tool.id as keyof typeof dict.tool]?.shortDesc ?? tool.description}
                hoverTextClass={meta.hoverText}
                popularLabel={dict.nav.popular}
                newLabel={dict.nav.new}
                onNavigate={onNavigate}
              />
            ))}
          </div>

          {featured && (
            <FeaturedToolCard
              lang={lang}
              tool={featured}
              name={dict.tool[featured.id as keyof typeof dict.tool]?.name ?? featured.name}
              description={dict.tool[featured.id as keyof typeof dict.tool]?.shortDesc ?? featured.description}
              meta={meta}
              label={dict.nav.featuredTool}
              ctaLabel={dict.nav.tryNow}
              onNavigate={onNavigate}
            />
          )}
        </div>
      </div>

      <div className="mt-4 border-t pt-3">
        <Link
          href={`/${lang}/tools#${category}`}
          onClick={onNavigate}
          className={`text-sm font-medium text-muted-foreground hover:text-foreground`}
        >
          {dict.nav.browseAll.replace('{category}', categoryDict.label)} →
        </Link>
      </div>
    </div>
  )
}
