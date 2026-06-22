import { db } from '@/lib/db'
import { FileText, Users, Download, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getStats() {
  try {
    const [totalConversions, totalDownloads, todayConversions, toolCount] =
      await Promise.all([
        db.toolUsageLog.count({ where: { event: 'conversion_complete' } }),
        db.toolUsageLog.count({ where: { event: 'download' } }),
        db.toolUsageLog.count({
          where: {
            event: 'conversion_complete',
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
        db.tool.count({ where: { isActive: true } }),
      ])

    return { totalConversions, totalDownloads, todayConversions, toolCount }
  } catch {
    return { totalConversions: 0, totalDownloads: 0, todayConversions: 0, toolCount: 0 }
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats()

  const cards = [
    {
      label: 'Total Conversions',
      value: stats.totalConversions.toLocaleString(),
      icon: TrendingUp,
      color: 'text-blue-500 bg-blue-500/10',
    },
    {
      label: 'Total Downloads',
      value: stats.totalDownloads.toLocaleString(),
      icon: Download,
      color: 'text-green-500 bg-green-500/10',
    },
    {
      label: 'Today',
      value: stats.todayConversions.toLocaleString(),
      icon: Users,
      color: 'text-orange-500 bg-orange-500/10',
    },
    {
      label: 'Active Tools',
      value: stats.toolCount.toLocaleString(),
      icon: FileText,
      color: 'text-purple-500 bg-purple-500/10',
    },
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}
              >
                <card.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Quick Start</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>1. Go to <strong>Settings</strong> to configure site name, logo, and branding</p>
          <p>2. Go to <strong>Tools</strong> to manage your conversion tools</p>
          <p>3. Go to <strong>Landing Page</strong> to customize your homepage content</p>
          <p>4. Go to <strong>Ads</strong> to set up advertising slots</p>
          <p>5. Go to <strong>Analytics</strong> to track user activity</p>
        </div>
      </div>
    </div>
  )
}
