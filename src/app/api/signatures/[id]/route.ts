import { NextResponse } from 'next/server'
import { del } from '@vercel/blob'
import { db } from '@/lib/db'
import { getUserSession } from '@/lib/user-auth'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const signature = await db.userSignature.findUnique({ where: { id } })

  if (!signature || signature.userId !== session.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await db.userSignature.delete({ where: { id } })

  try {
    await del(signature.url)
  } catch (error) {
    console.error('Signature blob deletion failed:', error)
  }

  return NextResponse.json({ success: true })
}
