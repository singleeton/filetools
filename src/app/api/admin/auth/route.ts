import { NextRequest, NextResponse } from 'next/server'
import {
  authenticateAdmin,
  createToken,
  setAdminCookie,
  clearAdminCookie,
  getAdminSession,
} from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 },
    )
  }

  const session = await authenticateAdmin(email, password)
  if (!session) {
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 },
    )
  }

  const token = createToken(session)
  await setAdminCookie(token)

  return NextResponse.json({ success: true, user: session })
}

export async function GET() {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
  return NextResponse.json({ authenticated: true, user: session })
}

export async function DELETE() {
  await clearAdminCookie()
  return NextResponse.json({ success: true })
}
