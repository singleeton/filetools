'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts'
import { useAdminLang } from '@/components/admin/admin-lang-provider'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function AnalyticsCharts({
  dailyData,
  perTool,
}: {
  dailyData: { date: string; views: number }[]
  perTool: { name: string; count: number }[]
}) {
  const { t } = useAdminLang()

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border bg-card p-6">
        <h3 className="mb-4 font-semibold">{t.last30Days}</h3>
        {dailyData.some((d) => d.views > 0) ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" fontSize={11} interval={4} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="views" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">{t.noData}</div>
        )}
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h3 className="mb-4 font-semibold">{t.conversionsByTool}</h3>
        {perTool.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={perTool} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" fontSize={12} />
              <YAxis type="category" dataKey="name" fontSize={12} width={100} />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {perTool.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">{t.noConversions}</div>
        )}
      </div>
    </div>
  )
}
