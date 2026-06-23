'use client'

import { useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminLangSwitcher } from './admin-lang-switcher'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { useAdminLang } from './admin-lang-provider'
import type { AdminSession } from '@/lib/admin-auth'

export function AdminHeader({ session }: { session: AdminSession }) {
  const router = useRouter()
  const { t } = useAdminLang()

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <h2 className="text-lg font-semibold">{t.dashboard}</h2>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <AdminLangSwitcher />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{session.name}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          {t.logout}
        </Button>
      </div>
    </header>
  )
}
