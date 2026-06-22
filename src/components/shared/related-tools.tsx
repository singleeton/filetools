'use client'

import Link from 'next/link'
import { useDictionary } from '@/lib/i18n/dictionary-context'

interface RelatedToolsProps {
  currentToolId: string
}

export function RelatedTools({ currentToolId }: RelatedToolsProps) {
  const { dict, lang } = useDictionary()
  const toolIds = Object.keys(dict.tool) as (keyof typeof dict.tool)[]
  const otherTools = toolIds.filter((id) => id !== currentToolId)

  return (
    <section className="mt-12 border-t pt-12">
      <h2 className="mb-6 text-center text-xl font-semibold">
        {dict.ui.relatedTools}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {otherTools.map((id) => (
          <Link
            key={id}
            href={`/${lang}/${id}`}
            className="rounded-lg border bg-card p-4 text-center transition-colors hover:border-primary/50 hover:bg-accent"
          >
            <h3 className="text-sm font-semibold">{dict.tool[id].name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {dict.tool[id].shortDesc}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
