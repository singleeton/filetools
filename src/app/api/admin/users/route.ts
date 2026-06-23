import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/admin-auth'

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, name: true, plan: true, usageToday: true, createdAt: true },
  })

  return NextResponse.json({ users })
}
