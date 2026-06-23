import { db } from '@/lib/db'
import { BarChart3, TrendingUp, Download, Upload, AlertCircle, Eye } from 'lucide-react'
import { AnalyticsCharts } from './analytics-charts'

export const dynamic = 'force-dynamic'

async function getAnalytics() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  try {
    const [views, uploads, conversions, downloads, errors, toolStats, dailyRaw] =
      await Promise.all([
        db.pageView.count(),
        db.toolUsageLog.count({ where: { event: 'upload_start' } }),
        db.toolUsageLog.count({ where: { event: 'conversion_complete' } }),
        db.toolUsageLog.count({ where: { event: 'download_click' } }),
        db.toolUsageLog.count({ where: { event: 'conversion_error' } }),
        db.toolUsageLog.groupBy({
          by: ['toolId'],
          _count: true,
          where: { event: 'conversion_complete' },
        }),
        db.pageView.groupBy({
          by: ['createdAt'],
          _count: true,
          where: { createdAt: { gte: thirtyDaysAgo } },
          orderBy: { createdAt: 'asc' },
        }),
      ])

    const toolIds = toolStats.map((t) => t.toolId)
    const tools = toolIds.length > 0
      ? await db.tool.findMany({ where: { id: { in: toolIds } } })
      : []

    const perTool = toolStats.map((t) => ({
      name: tools.find((tool) => tool.id === t.toolId)?.name || 'Unknown',
      slug: tools.find((tool) => tool.id === t.toolId)?.slug || '',
      count: t._count,
    })).sort((a, b) => b.count - a.count)

    const dailyData = buildMonthlyData(dailyRaw, thirtyDaysAgo)

    const recentLogs = await db.toolUsageLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: { tool: true },
    })

    return { views, uploads, conversions, downloads, errors, perTool, dailyData, recentLogs }
  } catch {
    return { views: 0, uploads: 0, conversions: 0, downloads: 0, errors: 0, perTool: [], dailyData: [], recentLogs: [] }
  }
}

function buildMonthlyData(raw: { createdAt: Date; _count: number }[], start: Date) {
  const days: { date: string; views: number }[] = []
  for (let i = 0; i < 30; i++) {
    const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().split('T')[0]
    const count = raw.filter((r) => r.createdAt.toISOString().split('T')[0] === key).reduce((s, r) => s + r._count, 0)
    days.push({ date: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }), views: count })
  }
  return days
}

export default async function AnalyticsPage() {
  const data = await getAnalytics()

  const stats = [
    { label: 'Page Views', value: data.views, icon: Eye, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Uploads', value: data.uploads, icon: Upload, color: 'text-cyan-500 bg-cyan-500/10' },
    { label: 'Conversions', value: data.conversions, icon: TrendingUp, color: 'text-green-500 bg-green-500/10' },
    { label: 'Downloads', value: data.downloads, icon: Download, color: 'text-purple-500 bg-purple-500/10' },
    { label: 'Errors', value: data.errors, icon: AlertCircle, color: 'text-red-500 bg-red-500/10' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.color}`}>
                <s.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold">{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <AnalyticsCharts dailyData={data.dailyData} perTool={data.perTool} />

      <div className="rounded-xl border bg-card">
        <div className="border-b p-4"><h2 className="font-semibold">Recent Events</h2></div>
        {data.recentLogs.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No events recorded yet</div>
        ) : (
          <div className="divide-y max-h-96 overflow-y-auto">
            {data.recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className={`inline-block h-2 w-2 rounded-full ${
                    log.event.includes('error') ? 'bg-red-500' :
                    log.event.includes('complete') ? 'bg-green-500' :
                    log.event.includes('download') ? 'bg-purple-500' : 'bg-blue-500'
                  }`} />
                  <span className="font-medium">{log.tool?.name}</span>
                  <span className="text-muted-foreground">{log.event.replace(/_/g, ' ')}</span>
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
