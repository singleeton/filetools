'use client'

import { FileText, Users, Download, TrendingUp, Globe, Wrench, CalendarDays, BarChart3 } from 'lucide-react'
import { useAdminLang } from '@/components/admin/admin-lang-provider'
import { DashboardCharts } from './dashboard-charts'

interface Stats {
  totalViews: number; todayViews: number
  totalConversions: number; todayConversions: number
  totalDownloads: number; todayDownloads: number
  toolCount: number; activeLanguages: number
  mostUsedTool: string
  dailyData: { date: string; views: number }[]
  toolUsageData: { name: string; count: number }[]
}

export function DashboardClient({ stats }: { stats: Stats }) {
  const { t } = useAdminLang()

  const cards = [
    { label: t.totalVisitors, value: stats.totalViews, icon: Users, color: 'text-blue-500 bg-blue-500/10' },
    { label: t.visitorsToday, value: stats.todayViews, icon: CalendarDays, color: 'text-cyan-500 bg-cyan-500/10' },
    { label: t.totalConversions, value: stats.totalConversions, icon: TrendingUp, color: 'text-green-500 bg-green-500/10' },
    { label: t.conversionsToday, value: stats.todayConversions, icon: BarChart3, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: t.totalDownloads, value: stats.totalDownloads, icon: Download, color: 'text-purple-500 bg-purple-500/10' },
    { label: t.downloadsToday, value: stats.todayDownloads, icon: Download, color: 'text-violet-500 bg-violet-500/10' },
    { label: t.mostUsedTool, value: stats.mostUsedTool, icon: FileText, color: 'text-orange-500 bg-orange-500/10', isText: true },
    { label: t.activeTools, value: stats.toolCount, icon: Wrench, color: 'text-pink-500 bg-pink-500/10' },
    { label: t.languages, value: stats.activeLanguages, icon: Globe, color: 'text-teal-500 bg-teal-500/10' },
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{t.dashboard}</h1>

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

      <DashboardCharts dailyData={stats.dailyData} toolUsageData={stats.toolUsageData} />
    </div>
  )
}
