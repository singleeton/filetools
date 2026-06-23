'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { useAdminLang } from '@/components/admin/admin-lang-provider'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function DashboardCharts({
  dailyData,
  toolUsageData,
}: {
  dailyData: { date: string; views: number }[]
  toolUsageData: { name: string; count: number }[]
}) {
  const { t } = useAdminLang()

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border bg-card p-6">
        <h3 className="mb-4 font-semibold">{t.last7Days}</h3>
        {dailyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">{t.noData}</div>
        )}
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h3 className="mb-4 font-semibold">{t.toolUsage}</h3>
        {toolUsageData.length > 0 ? (
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={250}>
              <PieChart>
                <Pie data={toolUsageData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {toolUsageData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {toolUsageData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">{t.noConversions}</div>
        )}
      </div>
    </div>
  )
}
