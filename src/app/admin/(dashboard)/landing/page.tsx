import { db } from '@/lib/db'
import { LandingCmsClient } from './landing-cms-client'

export const dynamic = 'force-dynamic'

async function getLandingContent() {
  try {
    const content = await db.landingContent.findMany({
      orderBy: [{ section: 'asc' }, { locale: 'asc' }],
    })
    return content.map((c) => ({ ...c }))
  } catch {
    return []
  }
}

export default async function LandingPage() {
  const content = await getLandingContent()
  return <LandingCmsClient initialContent={JSON.parse(JSON.stringify(content))} />
}
