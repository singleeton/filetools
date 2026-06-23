import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/admin-auth'

export async function GET() {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const slots = await db.adSlot.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json({ slots })
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, label, code, isActive } = await request.json()

  const slot = await db.adSlot.upsert({
    where: { name },
    update: { label, code, isActive },
    create: { name, label, code, isActive },
  })

  return NextResponse.json({ success: true, slot })
}
