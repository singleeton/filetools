import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { SetHtmlLang } from '@/components/layout/set-html-lang'
import { PageTracker } from '@/components/layout/page-tracker'
import { DictionaryProvider } from '@/lib/i18n/dictionary-context'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { isValidLocale, locales } from '@/lib/i18n/config'
import type { Locale } from '@/lib/i18n/config'

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

  const dict = await getDictionary(lang as Locale)

  return (
    <DictionaryProvider dictionary={dict} lang={lang as Locale}>
      <SetHtmlLang lang={lang} />
      <PageTracker />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </DictionaryProvider>
  )
}
