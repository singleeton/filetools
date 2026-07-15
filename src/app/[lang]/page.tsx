import Link from 'next/link'
import NextImage from 'next/image'
import {
  Upload, Cog, Download, Zap, Shield, Monitor, Globe,
  ServerOff, Trash2, Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HomeStructuredData, FaqStructuredData } from '@/components/shared/structured-data'
import { AdSlot } from '@/components/shared/ad-slot'
import { FloatingIcons } from '@/components/landing/floating-icons'
import { HeroVisual } from '@/components/landing/hero-visual'
import { HeroDropzone } from '@/components/landing/hero-dropzone'
import { CategoryCard } from '@/components/landing/category-card'
import { AnimatedCounter } from '@/components/landing/animated-counter'
import { ToolShowcase } from '@/components/landing/tool-showcase'
import { HowItWorksSteps } from '@/components/landing/how-it-works-steps'
import { SectionGlow } from '@/components/landing/section-glow'
import { FaqAccordion } from '@/components/landing/faq-accordion'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { getDictionaryWithOverrides } from '@/lib/landing-content'
import { locales, type Locale } from '@/lib/i18n/config'
import { getToolById, tools } from '@/lib/tools-registry'
import { categoryMeta, categoryOrder, getCategoryToolCount } from '@/lib/categories'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const dict = await getDictionary(lang as Locale)
  const alternates: Record<string, string> = {}
  locales.forEach((l) => { alternates[l] = `/${l}` })

  return {
    title: dict.meta.home.title,
    description: dict.meta.home.description,
    alternates: { languages: alternates },
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionaryWithOverrides(lang as Locale)

  const featureIcons = [
    <Zap key="z" className="h-6 w-6" />,
    <Shield key="s" className="h-6 w-6" />,
    <Monitor key="m" className="h-6 w-6" />,
    <Globe key="g" className="h-6 w-6" />,
  ]
  const featureKeys = ['fast', 'secure', 'noInstall', 'mobile'] as const
  const stepIcons = [
    <Upload key="u" className="h-8 w-8" />,
    <Cog key="c" className="h-8 w-8" />,
    <Download key="d" className="h-8 w-8" />,
  ]
  const stepKeys = ['step1', 'step2', 'step3'] as const
  const trustItems = ([
    { icon: <ServerOff className="h-6 w-6" />, ...dict.trust.noStorage },
    { icon: <Trash2 className="h-6 w-6" />, ...dict.trust.autoDelete },
    { icon: <Lock className="h-6 w-6" />, ...dict.trust.encrypted },
  ] as const)

  const showcaseTools = [
    { tool: getToolById('pdf-merge'), copy: dict.showcase.pdfMerge },
    { tool: getToolById('pdf-split'), copy: dict.showcase.pdfWorkspace },
    { tool: getToolById('remove-bg'), copy: dict.showcase.removeBg },
  ].filter((entry): entry is { tool: NonNullable<typeof entry.tool>; copy: { title: string; description: string } } => Boolean(entry.tool?.screenshot))

  return (
    <>
      <HomeStructuredData />
      <FaqStructuredData items={dict.faq.items} />

      {/* HERO */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-background to-muted/30">
        <FloatingIcons />
        <div className="container relative mx-auto grid gap-12 px-4 py-20 sm:py-28 lg:grid-cols-2 lg:items-center">
          <div className="text-center lg:text-left">
            {dict.hero.badge && (
              <span className="inline-flex items-center rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                {dict.hero.badge}
              </span>
            )}
            <h1 className="mx-auto mt-5 max-w-xl text-4xl font-bold tracking-tight sm:text-5xl lg:mx-0 lg:text-6xl">
              {dict.hero.title}
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground sm:text-xl lg:mx-0">
              {dict.hero.subtitle}
            </p>
            <div className="mt-8 flex justify-center lg:justify-start">
              <Link href={`/${lang}/tools`}>
                <Button size="lg" className="text-base">{dict.hero.cta}</Button>
              </Link>
            </div>
            <HeroDropzone lang={lang} hint={dict.hero.dropHint} />
          </div>

          <div>
            {dict.hero.image ? (
              <NextImage
                src={dict.hero.image}
                alt={dict.hero.title}
                width={960}
                height={480}
                unoptimized
                className="mx-auto w-full max-w-lg rounded-xl border object-cover"
              />
            ) : (
              <HeroVisual
                convertedIn={dict.hero.visual.convertedIn}
                noWatermark={dict.hero.visual.noWatermark}
                autoDeleted={dict.hero.visual.autoDeleted}
              />
            )}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <SectionGlow colors={['bg-blue-500/10', 'bg-emerald-500/10', 'bg-violet-500/10']} />
        <div className="container relative mx-auto px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight">{dict.categories.title}</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">{dict.categories.subtitle}</p>
          <div className="mx-auto mt-12 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categoryOrder.map((cat, i) => {
              const count = getCategoryToolCount(cat)
              return (
                <CategoryCard
                  key={cat}
                  lang={lang}
                  meta={categoryMeta[cat]}
                  label={dict.categories[cat].label}
                  tagline={dict.categories[cat].tagline}
                  countLabel={dict.categories.toolsCount.replace('{count}', String(count))}
                  comingSoon={count === 0}
                  comingSoonLabel={dict.categories.comingSoon}
                  index={i}
                />
              )
            })}
          </div>
        </div>
      </section>

      {/* INTERACTIVE SHOWCASE */}
      {showcaseTools.length > 0 && (
        <section className="relative overflow-hidden border-y bg-muted/30 py-16 sm:py-20">
          <SectionGlow colors={['bg-violet-500/10', 'bg-amber-500/10', 'bg-rose-500/10']} />
          <div className="container relative mx-auto px-4">
            <h2 className="text-center text-3xl font-bold tracking-tight">{dict.showcase.title}</h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">{dict.showcase.subtitle}</p>
            <div className="mx-auto mt-14 max-w-5xl space-y-16">
              {showcaseTools.map(({ tool, copy }, i) => (
                <ToolShowcase
                  key={tool.id}
                  title={copy.title}
                  description={copy.description}
                  screenshot={tool.screenshot!}
                  accent={categoryMeta[tool.category].accent}
                  reversed={i % 2 === 1}
                  index={i}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight">{dict.howItWorks.title}</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">{dict.howItWorks.subtitle}</p>
          <HowItWorksSteps
            steps={stepKeys.map((key, i) => ({
              icon: stepIcons[i],
              number: i + 1,
              title: dict.howItWorks[key].title,
              description: dict.howItWorks[key].description,
            }))}
          />
        </div>
      </section>

      {/* ADS */}
      <div className="container mx-auto px-4 py-8">
        <AdSlot name="landing-mid" />
      </div>

      {/* WHY CHOOSE US (features + trust merged) */}
      <section className="border-y bg-muted/30 py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight">{dict.features.title}</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">{dict.features.subtitle}</p>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featureKeys.map((key, i) => (
              <div key={key} className="flex gap-4 rounded-xl border bg-card p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {featureIcons[i]}
                </div>
                <div>
                  <h3 className="font-semibold">{dict.features[key].title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{dict.features[key].description}</p>
                </div>
              </div>
            ))}
            {trustItems.map((item) => (
              <div key={item.title} className="flex gap-4 rounded-xl border bg-card p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE STATISTICS */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <SectionGlow colors={['bg-primary/5', 'bg-emerald-500/10', 'bg-blue-500/10']} />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 divide-y-0 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
                <AnimatedCounter value={tools.length} suffix="+" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{dict.stats.toolsLabel}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
                <AnimatedCounter value={categoryOrder.length} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{dict.stats.categoriesLabel}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">{dict.stats.freeValue}</div>
              <p className="mt-2 text-sm text-muted-foreground">{dict.stats.freeLabel}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">{dict.stats.signupValue}</div>
              <p className="mt-2 text-sm text-muted-foreground">{dict.stats.signupLabel}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t bg-muted/30 py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight">{dict.faq.title}</h2>
          <div className="mx-auto mt-12 max-w-2xl">
            <FaqAccordion items={dict.faq.items} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight">{dict.cta.title}</h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">{dict.cta.subtitle}</p>
          <div className="mt-8">
            <Link href={`/${lang}/tools`}>
              <Button size="lg" className="text-base">{dict.cta.button}</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
