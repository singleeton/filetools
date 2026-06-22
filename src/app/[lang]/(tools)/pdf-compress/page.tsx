import { PdfCompressClient } from './client'
import { generateToolMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  return generateToolMetadata(lang, 'pdf-compress')
}

export default function PdfCompressPage() {
  return <PdfCompressClient />
}
