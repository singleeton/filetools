import { NextRequest, NextResponse } from 'next/server'
import { registerUser, createUserToken, setUserCookie } from '@/lib/user-auth'

export async function POST(request: NextRequest) {
  const { email, password, name } = await request.json()

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }

  const result = await registerUser(email, password, name)

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  const token = createUserToken(result.user)
  await setUserCookie(token)

  return NextResponse.json({ success: true, user: result.user })
}
