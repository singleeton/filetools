import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { db } from './db'

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'change-this'
const TOKEN_NAME = 'user_token'

export interface UserSession {
  id: string
  email: string
  name: string
  plan: string
}

export async function registerUser(email: string, password: string, name: string) {
  const existing = await db.user.findUnique({ where: { email } })
  if (existing) return { error: 'Email already registered' }

  const hashed = await bcrypt.hash(password, 12)
  const user = await db.user.create({
    data: { email, password: hashed, name },
  })

  return { user: { id: user.id, email: user.email, name: user.name, plan: user.plan } }
}

export async function loginUser(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email } })
  if (!user) return null

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return null

  return { id: user.id, email: user.email, name: user.name, plan: user.plan } as UserSession
}

export function createUserToken(session: UserSession): string {
  return jwt.sign(session, JWT_SECRET, { expiresIn: '30d' })
}

export function verifyUserToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession
  } catch {
    return null
  }
}

export async function getUserSession(): Promise<UserSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(TOKEN_NAME)?.value
  if (!token) return null
  return verifyUserToken(token)
}

export async function setUserCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  })
}

export async function clearUserCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(TOKEN_NAME)
}
