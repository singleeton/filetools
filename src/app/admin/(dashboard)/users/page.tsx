import { db } from '@/lib/db'
import { UsersClient } from './users-client'

export const dynamic = 'force-dynamic'

async function getUsers() {
  try {
    return await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, plan: true, usageToday: true, createdAt: true },
    })
  } catch {
    return []
  }
}

export default async function UsersPage() {
  const users = await getUsers()
  return <UsersClient users={JSON.parse(JSON.stringify(users))} />
}
