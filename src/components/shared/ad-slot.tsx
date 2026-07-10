import { db } from '@/lib/db'
import { AdSlotRenderer } from './ad-slot-renderer'

export async function AdSlot({ name }: { name: string }) {
  let slot: { code: string | null; isActive: boolean } | null = null

  try {
    slot = await db.adSlot.findUnique({
      where: { name },
      select: { code: true, isActive: true },
    })
  } catch {
    return null
  }

  if (!slot || !slot.isActive || !slot.code) return null

  return <AdSlotRenderer name={name} code={slot.code} />
}
