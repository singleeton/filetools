'use client'

import Link from 'next/link'
import { Star, Sparkles, ArrowRight } from 'lucide-react'
import { getPopularTools, getNewTools } from '@/lib/tools-registry'
import { useDictionary } from '@/lib/i18n/dictionary-context'
import { MegaMenuCard } from './mega-menu-card'

interface ToolsMegaMenuProps {
  onNavigate: () => void
}

export function ToolsMegaMenu({ onNavigate }: ToolsMegaMenuProps) {
  const { dict, lang } = useDictionary()
  const popular = getPopularTools()
  const fresh = getNewTools()

  return (
    <div className="w-[520px] p-5">
      <div className="grid grid-cols-2 gap-5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <Star className="h-3.5 w-3.5 text-amber-500" />
            {dict.nav.popularTools}
          </div>
          <div className="mt-2 space-y-0.5">
            {popular.map((tool) => (
              <MegaMenuCard
                key={tool.id}
                lang={lang}
                tool={tool}
                name={dict.tool[tool.id as keyof typeof dict.tool]?.name ?? tool.name}
                description={dict.tool[tool.id as keyof typeof dict.tool]?.shortDesc ?? tool.description}
                hoverTextClass="group-hover:text-primary"
                popularLabel={dict.nav.popular}
                newLabel={dict.nav.new}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            {dict.nav.newTools}
          </div>
          <div className="mt-2 space-y-0.5">
            {fresh.map((tool) => (
              <MegaMenuCard
                key={tool.id}
                lang={lang}
                tool={tool}
                name={dict.tool[tool.id as keyof typeof dict.tool]?.name ?? tool.name}
                description={dict.tool[tool.id as keyof typeof dict.tool]?.shortDesc ?? tool.description}
                hoverTextClass="group-hover:text-primary"
                popularLabel={dict.nav.popular}
                newLabel={dict.nav.new}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 border-t pt-3">
        <Link
          href={`/${lang}/tools`}
          onClick={onNavigate}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          {dict.nav.viewAllTools}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}
