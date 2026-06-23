import { db } from '@/lib/db'
import { BarChart3, TrendingUp, Download, Upload } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getAnalytics() {
  try {
    const [totalViews, totalConversions, totalDownloads, recentLogs] = await Promise.all([
      db.pageView.count(),
      db.toolUsageLog.count({ where: { event: 'conversion_complete' } }),
      db.toolUsageLog.count({ where: { event: 'download' } }),
      db.toolUsageLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { tool: true },
      }),
    ])
    return { totalViews, totalConversions, totalDownloads, recentLogs }
  } catch {
    return { totalViews: 0, totalConversions: 0, totalDownloads: 0, recentLogs: [] }
  }
}

export default async function AnalyticsPage() {
  const data = await getAnalytics()

  const stats = [
    { label: 'Page Views', value: data.totalViews, icon: BarChart3, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Conversions', value: data.totalConversions, icon: TrendingUp, color: 'text-green-500 bg-green-500/10' },
    { label: 'Downloads', value: data.totalDownloads, icon: Download, color: 'text-purple-500 bg-purple-500/10' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card">
        <div className="border-b p-4">
          <h2 className="font-semibold">Recent Activity</h2>
        </div>
        {data.recentLogs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Upload className="mx-auto h-8 w-8" />
            <p className="mt-2">No activity yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {data.recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 text-sm">
                <div>
                  <span className="font-medium">{log.tool?.name || log.toolId}</span>
                  <span className="ml-2 text-muted-foreground">{log.event}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
