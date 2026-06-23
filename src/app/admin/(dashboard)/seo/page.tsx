import { db } from '@/lib/db'
import { SeoManager } from './seo-manager'

export const dynamic = 'force-dynamic'

async function getSeoData() {
  try {
    const content = await db.landingContent.findMany({
      orderBy: [{ section: 'asc' }, { locale: 'asc' }],
    })
    return content.map((c) => ({
      ...c,
      content: c.content,
    }))
  } catch {
    return []
  }
}

export default async function SeoPage() {
  const seoData = await getSeoData()
  return <SeoManager initialData={JSON.parse(JSON.stringify(seoData))} />
}
