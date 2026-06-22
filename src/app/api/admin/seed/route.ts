import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  const seedSecret = request.headers.get('x-seed-secret')
  if (seedSecret !== process.env.ADMIN_SEED_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const existingAdmin = await db.adminUser.findFirst()
  if (existingAdmin) {
    return NextResponse.json({ error: 'Admin already exists' }, { status: 400 })
  }

  const { email, password, name } = await request.json()

  const hashed = await hashPassword(password)
  const admin = await db.adminUser.create({
    data: { email, password: hashed, name, role: 'superadmin' },
  })

  return NextResponse.json({
    success: true,
    admin: { id: admin.id, email: admin.email, name: admin.name },
  })
}
