import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Tool } from '@/types/tool'
import type { CategoryMeta } from '@/lib/categories'
import { renderNavIcon } from './tool-nav-icons'

interface FeaturedToolCardProps {
  lang: string
  tool: Tool
  name: string
  description: string
  meta: CategoryMeta
  label: string
  ctaLabel: string
  onNavigate?: () => void
}

export function FeaturedToolCard({ lang, tool, name, description, meta, label, ctaLabel, onNavigate }: FeaturedToolCardProps) {
  return (
    <Link
      href={`/${lang}${tool.href}`}
      onClick={onNavigate}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg`}
    >
      <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${meta.gradient} opacity-[0.08] transition-opacity group-hover:opacity-[0.14]`} />
      <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">{label}</span>
      <div className={`mt-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${meta.gradient} text-white shadow-sm`}>
        {renderNavIcon(tool.icon, 'h-5 w-5')}
      </div>
      <h4 className="mt-3 text-base font-semibold text-foreground">{name}</h4>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <span className={`mt-4 inline-flex items-center gap-1 text-sm font-medium ${meta.text}`}>
        {ctaLabel}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}
