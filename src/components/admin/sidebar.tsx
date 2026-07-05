'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Settings,
  Wrench,
  BarChart3,
  Megaphone,
  FileText,
  Globe,
  Search,
  Users,
  Newspaper,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdminLang } from './admin-lang-provider'

export function AdminSidebar() {
  const pathname = usePathname()
  const { t } = useAdminLang()

  const menuItems = [
    { href: '/admin', label: t.dashboard, icon: LayoutDashboard },
    { href: '/admin/tools', label: t.tools, icon: Wrench },
    { href: '/admin/analytics', label: t.analytics, icon: BarChart3 },
    { href: '/admin/landing', label: t.landing, icon: Globe },
    { href: '/admin/blog', label: 'Blog', icon: Newspaper },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/seo', label: 'SEO', icon: Search },
    { href: '/admin/ads', label: t.ads, icon: Megaphone },
    { href: '/admin/settings', label: t.settings, icon: Settings },
  ]

  return (
    <aside className="hidden w-64 flex-col border-r bg-card md:flex">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <FileText className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">{t.admin}</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
