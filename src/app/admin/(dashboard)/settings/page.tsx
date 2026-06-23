import { db } from '@/lib/db'
import { SettingsForm } from './settings-form'

export const dynamic = 'force-dynamic'

async function getSettings() {
  try {
    const settings = await db.siteSetting.findMany()
    const map: Record<string, string> = {}
    settings.forEach((s) => { map[s.key] = s.value })
    return map
  } catch {
    return {}
  }
}

export default async function SettingsPage() {
  const settings = await getSettings()
  return <SettingsForm initialSettings={settings} />
}
