import { db } from '@/lib/db'
import { AdsClient } from './ads-client'

export const dynamic = 'force-dynamic'

const DEFAULT_SLOTS = [
  { name: 'header', label: 'Header Banner' },
  { name: 'tool-top', label: 'Tool Page Top' },
  { name: 'tool-bottom', label: 'Tool Page Bottom' },
  { name: 'sidebar', label: 'Sidebar' },
  { name: 'landing-mid', label: 'Landing Page Middle' },
]

async function getSlots() {
  try {
    let slots = await db.adSlot.findMany({ orderBy: { name: 'asc' } })

    if (slots.length === 0) {
      for (const def of DEFAULT_SLOTS) {
        await db.adSlot.create({
          data: { name: def.name, label: def.label, code: '', isActive: false },
        })
      }
      slots = await db.adSlot.findMany({ orderBy: { name: 'asc' } })
    }

    return slots
  } catch {
    return []
  }
}

export default async function AdsPage() {
  const slots = await getSlots()
  return <AdsClient slots={JSON.parse(JSON.stringify(slots))} />
}
