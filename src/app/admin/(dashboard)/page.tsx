import { db } from '@/lib/db'
import { FileText, Users, Download, TrendingUp, Globe, Wrench, CalendarDays, BarChart3 } from 'lucide-react'
import { DashboardCharts } from './dashboard-charts'

export const dynamic = 'force-dynamic'

async function getStats() {
  const today = new Date(new Date().setHours(0, 0, 0, 0))
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  try {
    const [
      totalViews, todayViews,
      totalConversions, todayConversions,
      totalDownloads, todayDownloads,
      toolCount, activeLanguages,
      dailyViews, toolUsage,
    ] = await Promise.all([
      db.pageView.count(),
      db.pageView.count({ where: { createdAt: { gte: today } } }),
      db.toolUsageLog.count({ where: { event: 'conversion_complete' } }),
      db.toolUsageLog.count({ where: { event: 'conversion_complete', createdAt: { gte: today } } }),
      db.toolUsageLog.count({ where: { event: 'download_click' } }),
      db.toolUsageLog.count({ where: { event: 'download_click', createdAt: { gte: today } } }),
      db.tool.count({ where: { isActive: true } }),
      db.pageView.groupBy({ by: ['locale'], _count: true }),

      db.pageView.groupBy({
        by: ['createdAt'],
        _count: true,
        where: { createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: 'asc' },
      }),
      db.toolUsageLog.groupBy({
        by: ['toolId'],
        _count: true,
        where: { event: 'conversion_complete' },
      }),
    ])

    const toolIds = toolUsage.map((t) => t.toolId)
    const tools = toolIds.length > 0
      ? await db.tool.findMany({ where: { id: { in: toolIds } } })
      : []

    const toolUsageData = toolUsage.map((t) => ({
      name: tools.find((tool) => tool.id === t.toolId)?.name || 'Unknown',
      count: t._count,
    })).sort((a, b) => b.count - a.count)

    const dailyData = buildDailyData(dailyViews, sevenDaysAgo)
    const mostUsedTool = toolUsageData[0]?.name || 'N/A'

    return {
      totalViews, todayViews,
      totalConversions, todayConversions,
      totalDownloads, todayDownloads,
      toolCount,
      activeLanguages: activeLanguages.length,
      mostUsedTool,
      dailyData,
      toolUsageData,
    }
  } catch {
    return {
      totalViews: 0, todayViews: 0,
      totalConversions: 0, todayConversions: 0,
      totalDownloads: 0, todayDownloads: 0,
      toolCount: 5, activeLanguages: 4,
      mostUsedTool: 'N/A',
      dailyData: [],
      toolUsageData: [],
    }
  }
}

function buildDailyData(
  raw: { createdAt: Date; _count: number }[],
  startDate: Date,
) {
  const days: { date: string; views: number }[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().split('T')[0]
    const dayViews = raw.filter(
      (r) => r.createdAt.toISOString().split('T')[0] === key,
    )
    days.push({
      date: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      views: dayViews.reduce((sum, r) => sum + r._count, 0),
    })
  }
  return days
}

export default async function AdminDashboardPage() {
  const stats = await getStats()

  const cards = [
    { label: 'Total Visitors', value: stats.totalViews, icon: Users, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Visitors Today', value: stats.todayViews, icon: CalendarDays, color: 'text-cyan-500 bg-cyan-500/10' },
    { label: 'Total Conversions', value: stats.totalConversions, icon: TrendingUp, color: 'text-green-500 bg-green-500/10' },
    { label: 'Conversions Today', value: stats.todayConversions, icon: BarChart3, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Total Downloads', value: stats.totalDownloads, icon: Download, color: 'text-purple-500 bg-purple-500/10' },
    { label: 'Downloads Today', value: stats.todayDownloads, icon: Download, color: 'text-violet-500 bg-violet-500/10' },
    { label: 'Most Used Tool', value: stats.mostUsedTool, icon: FileText, color: 'text-orange-500 bg-orange-500/10', isText: true },
    { label: 'Active Tools', value: stats.toolCount, icon: Wrench, color: 'text-pink-500 bg-pink-500/10' },
    { label: 'Languages', value: stats.activeLanguages, icon: Globe, color: 'text-teal-500 bg-teal-500/10' },
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <p className={`mt-2 ${card.isText ? 'text-lg' : 'text-2xl'} font-bold`}>
              {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
            </p>
          </div>
        ))}
      </div>

      <DashboardCharts
        dailyData={stats.dailyData}
        toolUsageData={stats.toolUsageData}
      />
    </div>
  )
}
