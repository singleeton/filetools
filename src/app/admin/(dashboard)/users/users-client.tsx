'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Crown, User, Trash2 } from 'lucide-react'
import { useAdminLang } from '@/components/admin/admin-lang-provider'

interface UserData {
  id: string
  email: string
  name: string
  plan: string
  usageToday: number
  createdAt: string
}

export function UsersClient({ users: initialUsers }: { users: UserData[] }) {
  const [users, setUsers] = useState(initialUsers)
  const { t } = useAdminLang()

  const togglePlan = async (user: UserData) => {
    const newPlan = user.plan === 'premium' ? 'free' : 'premium'
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: newPlan }),
    })
    if (res.ok) {
      const data = await res.json()
      setUsers((prev) => prev.map((u) => (u.id === user.id ? data.user : u)))
    }
  }

  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure?')) return
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <span className="text-sm text-muted-foreground">{users.length} users</span>
      </div>

      {users.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <User className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No registered users yet</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-4">User</th>
                <th className="p-4">Plan</th>
                <th className="p-4">Usage Today</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="p-4">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.plan === 'premium'
                        ? 'bg-yellow-500/10 text-yellow-600'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {user.plan === 'premium' && <Crown className="h-3 w-3" />}
                      {user.plan}
                    </span>
                  </td>
                  <td className="p-4">{user.usageToday}</td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => togglePlan(user)}>
                        <Crown className="mr-1 h-3 w-3" />
                        {user.plan === 'premium' ? 'Downgrade' : 'Upgrade'}
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteUser(user.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
