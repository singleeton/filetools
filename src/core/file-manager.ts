import { writeFile, unlink, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { randomUUID } from 'crypto'

const TEMP_DIR = join(tmpdir(), 'filetools')
const CLEANUP_DELAY_MS = 5 * 60 * 1000

const scheduledCleanups = new Map<string, NodeJS.Timeout>()

async function ensureTempDir(): Promise<void> {
  if (!existsSync(TEMP_DIR)) {
    await mkdir(TEMP_DIR, { recursive: true })
  }
}

export function createSessionId(): string {
  return randomUUID()
}

export async function writeTempFile(
  sessionId: string,
  fileName: string,
  data: Buffer | Uint8Array,
): Promise<string> {
  await ensureTempDir()
  const safeName = `${sessionId}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const filePath = join(TEMP_DIR, safeName)
  await writeFile(filePath, data)
  scheduleCleanup(filePath)
  return filePath
}

export async function cleanupFile(filePath: string): Promise<void> {
  try {
    if (existsSync(filePath)) {
      await unlink(filePath)
    }
  } catch {
    // best-effort cleanup
  }
  const timer = scheduledCleanups.get(filePath)
  if (timer) {
    clearTimeout(timer)
    scheduledCleanups.delete(filePath)
  }
}

export async function cleanupSession(sessionId: string): Promise<void> {
  const entries = Array.from(scheduledCleanups.keys())
  for (const filePath of entries) {
    if (filePath.includes(sessionId)) {
      await cleanupFile(filePath)
    }
  }
}

function scheduleCleanup(filePath: string): void {
  const existing = scheduledCleanups.get(filePath)
  if (existing) clearTimeout(existing)

  const timer = setTimeout(async () => {
    await cleanupFile(filePath)
  }, CLEANUP_DELAY_MS)

  timer.unref()
  scheduledCleanups.set(filePath, timer)
}
