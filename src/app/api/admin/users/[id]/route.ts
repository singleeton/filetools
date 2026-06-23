import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/admin-auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const data = await request.json()

  const allowed = ['plan', 'name']
  const updateData: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in data) updateData[key] = data[key]
  }

  const user = await db.user.update({
    where: { id },
    data: updateData,
    select: { id: true, email: true, name: true, plan: true, usageToday: true, createdAt: true },
  })

  return NextResponse.json({ success: true, user })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await db.user.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
