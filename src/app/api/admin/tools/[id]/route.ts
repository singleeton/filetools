import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/admin-auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const data = await request.json()

  const allowed = ['name', 'description', 'category', 'icon', 'isActive', 'isPremium', 'sortOrder', 'maxFileSize', 'config']
  const updateData: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in data) updateData[key] = data[key]
  }

  const tool = await db.tool.update({
    where: { id },
    data: updateData,
  })

  return NextResponse.json({ success: true, tool })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const tool = await db.tool.findUnique({ where: { id } })

  if (!tool) {
    return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
  }

  return NextResponse.json({ tool })
}
