import { db } from '@/lib/db'
import { DashboardClient } from './dashboard-client'

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
      dailyRaw, toolUsage,
    ] = await Promise.all([
      db.pageView.count(),
      db.pageView.count({ where: { createdAt: { gte: today } } }),
      db.toolUsageLog.count({ where: { event: 'conversion_complete' } }),
      db.toolUsageLog.count({ where: { event: 'conversion_complete', createdAt: { gte: today } } }),
      db.toolUsageLog.count({ where: { event: 'download_click' } }),
      db.toolUsageLog.count({ where: { event: 'download_click', createdAt: { gte: today } } }),
      db.tool.count({ where: { isActive: true } }),
      db.pageView.groupBy({ by: ['locale'], _count: true }),
      db.pageView.groupBy({ by: ['createdAt'], _count: true, where: { createdAt: { gte: sevenDaysAgo } }, orderBy: { createdAt: 'asc' } }),
      db.toolUsageLog.groupBy({ by: ['toolId'], _count: true, where: { event: 'conversion_complete' } }),
    ])

    const toolIds = toolUsage.map((t) => t.toolId)
    const tools = toolIds.length > 0 ? await db.tool.findMany({ where: { id: { in: toolIds } } }) : []
    const toolUsageData = toolUsage.map((t) => ({
      name: tools.find((tool) => tool.id === t.toolId)?.name || 'Unknown',
      count: t._count,
    })).sort((a, b) => b.count - a.count)

    const dailyData: { date: string; views: number }[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo.getTime() + i * 86400000)
      const key = d.toISOString().split('T')[0]
      dailyData.push({
        date: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        views: dailyRaw.filter((r) => r.createdAt.toISOString().split('T')[0] === key).reduce((s, r) => s + r._count, 0),
      })
    }

    return {
      totalViews, todayViews, totalConversions, todayConversions,
      totalDownloads, todayDownloads, toolCount,
      activeLanguages: activeLanguages.length,
      mostUsedTool: toolUsageData[0]?.name || 'N/A',
      dailyData, toolUsageData,
    }
  } catch {
    return {
      totalViews: 0, todayViews: 0, totalConversions: 0, todayConversions: 0,
      totalDownloads: 0, todayDownloads: 0, toolCount: 5, activeLanguages: 4,
      mostUsedTool: 'N/A', dailyData: [], toolUsageData: [],
    }
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats()
  return <DashboardClient stats={stats} />
}
