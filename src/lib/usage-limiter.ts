import { db } from './db'
import { getUserSession } from './user-auth'
import { cookies } from 'next/headers'

const LIMITS = {
  guest: 5,
  free: 20,
  premium: -1, // unlimited
}

export async function checkUsageLimit(): Promise<{
  allowed: boolean
  remaining: number
  limit: number
  plan: string
}> {
  const session = await getUserSession()
  const today = new Date().toISOString().split('T')[0]

  if (session) {
    const user = await db.user.findUnique({ where: { id: session.id } })
    if (!user) return { allowed: false, remaining: 0, limit: 0, plan: 'free' }

    const limit = LIMITS[user.plan as keyof typeof LIMITS] ?? LIMITS.free
    if (limit === -1) return { allowed: true, remaining: -1, limit: -1, plan: user.plan }

    const lastDate = user.lastUsageDate.toISOString().split('T')[0]
    const usageToday = lastDate === today ? user.usageToday : 0
    const remaining = Math.max(0, limit - usageToday)

    return { allowed: remaining > 0, remaining, limit, plan: user.plan }
  }

  // Guest user — track via cookie
  const cookieStore = await cookies()
  const usageCookie = cookieStore.get('guest_usage')?.value
  let usage = { date: '', count: 0 }

  if (usageCookie) {
    try { usage = JSON.parse(usageCookie) } catch { /* ignore */ }
  }

  if (usage.date !== today) {
    usage = { date: today, count: 0 }
  }

  const remaining = Math.max(0, LIMITS.guest - usage.count)
  return { allowed: remaining > 0, remaining, limit: LIMITS.guest, plan: 'guest' }
}

export async function incrementUsage(): Promise<void> {
  const session = await getUserSession()
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  if (session) {
    const user = await db.user.findUnique({ where: { id: session.id } })
    if (!user) return

    const lastDate = user.lastUsageDate.toISOString().split('T')[0]
    const newCount = lastDate === todayStr ? user.usageToday + 1 : 1

    await db.user.update({
      where: { id: session.id },
      data: { usageToday: newCount, lastUsageDate: today },
    })
    return
  }

  // Guest
  const cookieStore = await cookies()
  const usageCookie = cookieStore.get('guest_usage')?.value
  let usage = { date: '', count: 0 }

  if (usageCookie) {
    try { usage = JSON.parse(usageCookie) } catch { /* ignore */ }
  }

  if (usage.date !== todayStr) {
    usage = { date: todayStr, count: 0 }
  }

  usage.count++

  cookieStore.set('guest_usage', JSON.stringify(usage), {
    httpOnly: true,
    maxAge: 86400,
    path: '/',
  })
}
