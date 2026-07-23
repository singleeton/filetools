import { NextResponse } from 'next/server'
import { getDictionaryWithOverrides } from '@/lib/landing-content'
import { isValidLocale } from '@/lib/i18n/config'

export async function GET(_request: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params

  if (!isValidLocale(lang)) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
  }

  const dict = await getDictionaryWithOverrides(lang)
  return NextResponse.json({ dict })
}
