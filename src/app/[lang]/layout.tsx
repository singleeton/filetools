import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { SetHtmlLang } from '@/components/layout/set-html-lang'
import { PageTracker } from '@/components/layout/page-tracker'
import { AdSlot } from '@/components/shared/ad-slot'
import { DictionaryProvider } from '@/lib/i18n/dictionary-context'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { isValidLocale, locales } from '@/lib/i18n/config'
import { getLandingOverrides, applyOverrides } from '@/lib/landing-content'
import type { Locale } from '@/lib/i18n/config'

export const dynamic = 'force-dynamic'

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  if (!isValidLocale(lang)) {
    notFound()
  }

  let dict = await getDictionary(lang as Locale)

  try {
    const overrides = await getLandingOverrides(lang)
    if (Object.keys(overrides).length > 0) {
      dict = applyOverrides(dict, overrides)
    }
  } catch {
    // use default dictionary
  }

  return (
    <DictionaryProvider dictionary={dict} lang={lang as Locale}>
      <SetHtmlLang lang={lang} />
      <PageTracker />
      <Header />
      <div className="container mx-auto px-4 pt-4">
        <AdSlot name="header" />
      </div>
      <main className="flex-1">{children}</main>
      <Footer />
    </DictionaryProvider>
  )
}
