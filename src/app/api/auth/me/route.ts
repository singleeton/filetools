import { NextResponse } from 'next/server'
import { getUserSession } from '@/lib/user-auth'

export async function GET() {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ user: null })
  }
  return NextResponse.json({ user: session })
}
