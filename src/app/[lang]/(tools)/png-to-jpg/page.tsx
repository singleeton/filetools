import { PngToJpgClient } from './client'
import { generateToolMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  return generateToolMetadata(lang, 'png-to-jpg')
}

export default function Page() {
  return <PngToJpgClient />
}
