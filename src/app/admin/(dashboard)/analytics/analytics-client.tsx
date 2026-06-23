'use client'

import { BarChart3, TrendingUp, Download, Upload, AlertCircle, Eye } from 'lucide-react'
import { useAdminLang } from '@/components/admin/admin-lang-provider'
import { AnalyticsCharts } from './analytics-charts'

interface LogEntry {
  id: string
  event: string
  createdAt: string
  tool?: { name: string } | null
}

interface AnalyticsData {
  views: number; uploads: number; conversions: number; downloads: number; errors: number
  perTool: { name: string; count: number }[]
  dailyData: { date: string; views: number }[]
  recentLogs: LogEntry[]
}

export function AnalyticsClient({ data }: { data: AnalyticsData }) {
  const { t } = useAdminLang()

  const stats = [
    { label: t.pageViews, value: data.views, icon: Eye, color: 'text-blue-500 bg-blue-500/10' },
    { label: t.uploads, value: data.uploads, icon: Upload, color: 'text-cyan-500 bg-cyan-500/10' },
    { label: t.conversions, value: data.conversions, icon: TrendingUp, color: 'text-green-500 bg-green-500/10' },
    { label: t.downloads, value: data.downloads, icon: Download, color: 'text-purple-500 bg-purple-500/10' },
    { label: t.errors, value: data.errors, icon: AlertCircle, color: 'text-red-500 bg-red-500/10' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.analytics}</h1>

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
        <div className="border-b p-4"><h2 className="font-semibold">{t.recentEvents}</h2></div>
        {data.recentLogs.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">{t.noEvents}</div>
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
