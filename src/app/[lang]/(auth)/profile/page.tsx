'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { User, LogOut, Crown } from 'lucide-react'
import { useDictionary } from '@/lib/i18n/dictionary-context'

interface UserData {
  id: string
  email: string
  name: string
  plan: string
}

export default function ProfilePage() {
  const { lang } = useDictionary()
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => { setUser(data.user); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push(`/${lang}`)
  }

  if (loading) {
    return <div className="container mx-auto flex min-h-[50vh] items-center justify-center">Loading...</div>
  }

  if (!user) {
    router.push(`/${lang}/login`)
    return null
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <div className="rounded-xl border bg-card p-8 space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        <div className="rounded-lg border p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Crown className="h-4 w-4 text-yellow-500" />
            <span className="font-medium capitalize">{user.plan} Plan</span>
          </div>
          {user.plan === 'free' && (
            <p className="mt-2 text-xs text-muted-foreground">
              Upgrade to Premium for unlimited conversions
            </p>
          )}
        </div>

        <Button variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
