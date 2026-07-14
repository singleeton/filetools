import Link from 'next/link'
import {
  FileText, FileOutput, Sheet, Image as ImageIcon, Sparkles, Video,
} from 'lucide-react'
import type { CategoryMeta } from '@/lib/categories'

const iconMap = {
  FileText, FileOutput, Sheet, Image: ImageIcon, Sparkles, Video,
} as const

interface CategoryCardProps {
  lang: string
  meta: CategoryMeta
  label: string
  tagline: string
  countLabel: string
  comingSoon: boolean
  comingSoonLabel: string
}

export function CategoryCard({ lang, meta, label, tagline, countLabel, comingSoon, comingSoonLabel }: CategoryCardProps) {
  const Icon = iconMap[meta.icon as keyof typeof iconMap] ?? FileText

  return (
    <Link
      href={`/${lang}#tools`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border p-6 transition-all hover:-translate-y-1 hover:shadow-lg ${comingSoon ? 'opacity-70' : ''}`}
    >
      <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${meta.gradient} opacity-[0.06] transition-opacity group-hover:opacity-[0.12]`} />
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${meta.gradient} text-white shadow-sm`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{label}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{tagline}</p>
      <span className={`mt-4 w-fit rounded-full px-2.5 py-1 text-xs font-medium ${comingSoon ? 'bg-muted text-muted-foreground' : `${meta.text} bg-current/10`}`}>
        {comingSoon ? comingSoonLabel : countLabel}
      </span>
    </Link>
  )
}
