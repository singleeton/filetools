import { db } from '@/lib/db'
import { ToolsList } from './tools-list'

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
  return <ToolsList tools={JSON.parse(JSON.stringify(tools))} />
}
