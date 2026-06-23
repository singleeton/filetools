import { db } from '@/lib/db'
import { AnalyticsClient } from './analytics-client'

export const dynamic = 'force-dynamic'

async function getAnalytics() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
  try {
    const [views, uploads, conversions, downloads, errors, toolStats, dailyRaw] = await Promise.all([
      db.pageView.count(),
      db.toolUsageLog.count({ where: { event: 'upload_start' } }),
      db.toolUsageLog.count({ where: { event: 'conversion_complete' } }),
      db.toolUsageLog.count({ where: { event: 'download_click' } }),
      db.toolUsageLog.count({ where: { event: 'conversion_error' } }),
      db.toolUsageLog.groupBy({ by: ['toolId'], _count: true, where: { event: 'conversion_complete' } }),
      db.pageView.groupBy({ by: ['createdAt'], _count: true, where: { createdAt: { gte: thirtyDaysAgo } }, orderBy: { createdAt: 'asc' } }),
    ])

    const toolIds = toolStats.map((t) => t.toolId)
    const tools = toolIds.length > 0 ? await db.tool.findMany({ where: { id: { in: toolIds } } }) : []
    const perTool = toolStats.map((t) => ({
      name: tools.find((tool) => tool.id === t.toolId)?.name || 'Unknown',
      count: t._count,
    })).sort((a, b) => b.count - a.count)

    const dailyData: { date: string; views: number }[] = []
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo.getTime() + i * 86400000)
      const key = d.toISOString().split('T')[0]
      dailyData.push({
        date: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        views: dailyRaw.filter((r) => r.createdAt.toISOString().split('T')[0] === key).reduce((s, r) => s + r._count, 0),
      })
    }

    const recentLogs = await db.toolUsageLog.findMany({ orderBy: { createdAt: 'desc' }, take: 30, include: { tool: true } })

    return { views, uploads, conversions, downloads, errors, perTool, dailyData, recentLogs: JSON.parse(JSON.stringify(recentLogs)) }
  } catch {
    return { views: 0, uploads: 0, conversions: 0, downloads: 0, errors: 0, perTool: [], dailyData: [], recentLogs: [] }
  }
}

export default async function AnalyticsPage() {
  const data = await getAnalytics()
  return <AnalyticsClient data={data} />
}
