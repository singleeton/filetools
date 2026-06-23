import { NextRequest, NextResponse } from 'next/server'
import { loginUser, createUserToken, setUserCookie } from '@/lib/user-auth'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  const session = await loginUser(email, password)

  if (!session) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const token = createUserToken(session)
  await setUserCookie(token)

  return NextResponse.json({ success: true, user: session })
}
