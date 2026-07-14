import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Tool } from '@/types/tool'
import { renderNavIcon } from './tool-nav-icons'

interface MegaMenuCardProps {
  lang: string
  tool: Tool
  name: string
  description: string
  /** Full literal `group-hover:text-...` class string from categoryMeta */
  hoverTextClass: string
  popularLabel: string
  newLabel: string
  onNavigate?: () => void
}

export function MegaMenuCard({ lang, tool, name, description, hoverTextClass, popularLabel, newLabel, onNavigate }: MegaMenuCardProps) {
  return (
    <Link
      href={`/${lang}${tool.href}`}
      onClick={onNavigate}
      className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-foreground/5"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground/5 text-muted-foreground transition-all group-hover:scale-110 group-hover:bg-foreground/10">
        {renderNavIcon(tool.icon, 'h-4.5 w-4.5')}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={`truncate text-sm font-medium text-foreground transition-colors ${hoverTextClass}`}>
            {name}
          </span>
          {tool.isPopular && (
            <span className="shrink-0 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
              {popularLabel}
            </span>
          )}
          {tool.isNew && (
            <span className="shrink-0 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              {newLabel}
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="mt-2 h-3.5 w-3.5 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
    </Link>
  )
}
