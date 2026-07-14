import Link from 'next/link'
import { Clock } from 'lucide-react'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { locales, type Locale } from '@/lib/i18n/config'
import { getToolsByCategory } from '@/lib/tools-registry'
import { categoryMeta, navCategoryOrder } from '@/lib/categories'
import { renderNavIcon } from '@/components/layout/nav/tool-nav-icons'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const dict = await getDictionary(lang as Locale)
  const alternates: Record<string, string> = {}
  locales.forEach((l) => { alternates[l] = `/${l}/tools` })

  return {
    title: dict.meta.tools.title,
    description: dict.meta.tools.description,
    alternates: { languages: alternates },
  }
}

export default async function ToolsPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as Locale)

  return (
    <div className="container mx-auto px-4 py-16 sm:py-20">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{dict.toolsPage.title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{dict.toolsPage.subtitle}</p>
      </div>

      <div className="mx-auto mt-14 max-w-4xl space-y-14">
        {navCategoryOrder.map((category) => {
          const meta = categoryMeta[category]
          const catTools = getToolsByCategory(category)
          const categoryDict = dict.categories[category]

          return (
            <section key={category} id={category} className="scroll-mt-20">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${meta.gradient} text-white`}>
                  {renderNavIcon(meta.icon, 'h-5 w-5')}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{categoryDict.label}</h2>
                  <p className="text-sm text-muted-foreground">{categoryDict.tagline}</p>
                </div>
              </div>

              {catTools.length === 0 ? (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {dict.nav.comingSoonDesc}
                </div>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {catTools.map((tool) => {
                    const toolDict = dict.tool[tool.id as keyof typeof dict.tool]
                    return (
                      <Link
                        key={tool.id}
                        href={`/${lang}${tool.href}`}
                        className="group flex items-start gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground/5 text-muted-foreground">
                          {renderNavIcon(tool.icon, 'h-4.5 w-4.5')}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium">{toolDict?.name ?? tool.name}</span>
                            {tool.isPopular && (
                              <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                                {dict.nav.popular}
                              </span>
                            )}
                            {tool.isNew && (
                              <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                                {dict.nav.new}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">{toolDict?.shortDesc ?? tool.description}</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
