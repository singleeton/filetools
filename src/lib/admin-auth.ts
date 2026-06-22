import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { db } from './db'

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'change-this-secret-in-production'
const TOKEN_NAME = 'admin_token'
const TOKEN_EXPIRY = '7d'

export interface AdminSession {
  id: string
  email: string
  name: string
  role: string
}

export async function authenticateAdmin(
  email: string,
  password: string,
): Promise<AdminSession | null> {
  const admin = await db.adminUser.findUnique({ where: { email } })
  if (!admin) return null

  const valid = await bcrypt.compare(password, admin.password)
  if (!valid) return null

  return { id: admin.id, email: admin.email, name: admin.name, role: admin.role }
}

export function createToken(session: AdminSession): string {
  return jwt.sign(session, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

export function verifyToken(token: string): AdminSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminSession
  } catch {
    return null
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(TOKEN_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export async function setAdminCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })
}

export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(TOKEN_NAME)
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}
