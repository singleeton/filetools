import { db } from '@/lib/db'
import { Wrench, Check, X } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getTools() {
  try {
    return await db.tool.findMany({ orderBy: { sortOrder: 'asc' } })
  } catch {
    return []
  }
}

export default async function ToolsPage() {
  const tools = await getTools()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tools Management</h1>
        <span className="text-sm text-muted-foreground">{tools.length} tools</span>
      </div>

      {tools.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Wrench className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            No tools in database yet. Tools are managed via code configuration.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-4">Tool</th>
                <th className="p-4">Category</th>
                <th className="p-4">Active</th>
                <th className="p-4">Premium</th>
              </tr>
            </thead>
            <tbody>
              {tools.map((tool) => (
                <tr key={tool.id} className="border-b last:border-0">
                  <td className="p-4">
                    <p className="font-medium">{tool.name}</p>
                    <p className="text-xs text-muted-foreground">/{tool.slug}</p>
                  </td>
                  <td className="p-4">{tool.category}</td>
                  <td className="p-4">
                    {tool.isActive ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                  </td>
                  <td className="p-4">
                    {tool.isPremium ? (
                      <Check className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
