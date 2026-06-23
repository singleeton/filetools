import { JpgToPngClient } from './client'
import { generateToolMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  return generateToolMetadata(lang, 'jpg-to-png')
}

export default function Page() {
  return <JpgToPngClient />
}
