import Link from 'next/link'
import NextImage from 'next/image'
import {
  FileText, Scissors, FileDown, FileOutput, Merge,
  Upload, Cog, Download, Zap, Shield, Monitor, Globe,
  ServerOff, Trash2, Lock, RotateCw, Image, Maximize, Eraser, Sheet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HomeStructuredData, FaqStructuredData } from '@/components/shared/structured-data'
import { AdSlot } from '@/components/shared/ad-slot'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { locales, type Locale } from '@/lib/i18n/config'
import { getLatestPublishedPosts } from '@/lib/blog'
import type { Metadata } from 'next'

const toolIcons: Record<string, React.ReactNode> = {
  Merge: <Merge className="h-8 w-8" />,
  Scissors: <Scissors className="h-8 w-8" />,
  FileDown: <FileDown className="h-8 w-8" />,
  FileText: <FileText className="h-8 w-8" />,
  FileOutput: <FileOutput className="h-8 w-8" />,
  RotateCw: <RotateCw className="h-8 w-8" />,
  Sheet: <Sheet className="h-8 w-8" />,
  Image: <Image className="h-8 w-8" />,
  Maximize: <Maximize className="h-8 w-8" />,
  Eraser: <Eraser className="h-8 w-8" />,
}

const toolIconMap: Record<string, string> = {
  'pdf-merge': 'Merge',
  'pdf-split': 'Scissors',
  'pdf-compress': 'FileDown',
  'pdf-rotate': 'RotateCw',
  'word-to-pdf': 'FileText',
  'pdf-to-word': 'FileOutput',
  'pdf-to-excel': 'Sheet',
  'jpg-to-png': 'Image',
  'png-to-jpg': 'Image',
  'image-resize': 'Maximize',
  'remove-bg': 'Eraser',
}

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
  const dict = await getDictionary(lang as Locale)
  const toolIds = Object.keys(dict.tool) as (keyof typeof dict.tool)[]
  const latestPosts = await getLatestPublishedPosts(lang, 3)

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

  return (
    <>
      <HomeStructuredData />
      <FaqStructuredData items={dict.faq.items} />

      {/* HERO */}
      <section className="border-b bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 py-20 text-center sm:py-28">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {dict.hero.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            {dict.hero.subtitle}
          </p>
          <div className="mt-8">
            <a href="#tools">
              <Button size="lg" className="text-base">{dict.hero.cta}</Button>
            </a>
          </div>
          {dict.hero.image && (
            <NextImage
              src={dict.hero.image}
              alt={dict.hero.title}
              width={960}
              height={480}
              unoptimized
              className="mx-auto mt-12 w-full max-w-3xl rounded-xl border object-cover"
            />
          )}
        </div>
      </section>

      {/* TOOL GRID */}
      <section id="tools" className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            {dict.popularTools.title}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            {dict.popularTools.subtitle}
          </p>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {toolIds.map((id) => (
              <Link
                key={id}
                href={`/${lang}/${id}`}
                className="group flex flex-col items-center rounded-xl border bg-card p-8 text-center transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  {toolIcons[toolIconMap[id]] || <FileText className="h-8 w-8" />}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{dict.tool[id].name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{dict.tool[id].shortDesc}</p>
                <span className="mt-4 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  {dict.popularTools.useTool}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-y bg-muted/30 py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight">{dict.features.title}</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">{dict.features.subtitle}</p>
          <div className="mx-auto mt-12 grid max-w-4xl gap-8 sm:grid-cols-2">
            {featureKeys.map((key, i) => (
              <div key={key} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {featureIcons[i]}
                </div>
                <div>
                  <h3 className="font-semibold">{dict.features[key].title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{dict.features[key].description}</p>
                  {dict.features[key].image && (
                    <NextImage
                      src={dict.features[key].image}
                      alt={dict.features[key].title}
                      width={400}
                      height={220}
                      unoptimized
                      className="mt-3 w-full max-w-xs rounded-lg border object-cover"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight">{dict.howItWorks.title}</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">{dict.howItWorks.subtitle}</p>
          <div className="mx-auto mt-12 grid max-w-3xl gap-8 sm:grid-cols-3">
            {stepKeys.map((key, i) => (
              <div key={key} className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {stepIcons[i]}
                </div>
                <div className="mt-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <h3 className="mt-3 font-semibold">{dict.howItWorks[key].title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{dict.howItWorks[key].description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ADS */}
      <div className="container mx-auto px-4 py-8">
        <AdSlot name="landing-mid" />
      </div>

      {/* TRUST */}
      <section className="border-t py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight">{dict.trust.title}</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">{dict.trust.subtitle}</p>
          <div className="mx-auto mt-12 grid max-w-4xl gap-8 sm:grid-cols-3">
            {([
              { icon: <ServerOff className="h-8 w-8" />, ...dict.trust.noStorage },
              { icon: <Trash2 className="h-8 w-8" />, ...dict.trust.autoDelete },
              { icon: <Lock className="h-8 w-8" />, ...dict.trust.encrypted },
            ] as const).map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-600">
                  {item.icon}
                </div>
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOG */}
      {latestPosts.length > 0 && (
        <section className="border-t py-16 sm:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-bold tracking-tight">{dict.blog.latestTitle}</h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">{dict.blog.latestSubtitle}</p>
            <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/${lang}/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:border-primary/50 hover:shadow-md"
                >
                  {post.coverImageUrl && (
                    <NextImage
                      src={post.coverImageUrl}
                      alt={post.title}
                      width={400}
                      height={220}
                      unoptimized
                      className="h-40 w-full object-cover"
                    />
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-semibold group-hover:text-primary">{post.title}</h3>
                    <p className="mt-2 flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
                    <span className="mt-4 text-sm font-medium text-primary">{dict.blog.readMore} →</span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href={`/${lang}/blog`} className="text-sm font-medium text-primary hover:underline">
                {dict.blog.viewAll} →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="border-t bg-muted/30 py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight">{dict.faq.title}</h2>
          <div className="mx-auto mt-12 max-w-2xl space-y-6">
            {dict.faq.items.map((item, i) => (
              <div key={i} className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold">{item.question}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight">{dict.cta.title}</h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">{dict.cta.subtitle}</p>
          <div className="mt-8">
            <a href="#tools">
              <Button size="lg" className="text-base">{dict.cta.button}</Button>
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
