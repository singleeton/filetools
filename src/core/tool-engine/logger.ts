type LogLevel = 'info' | 'warn' | 'error'

function formatMessage(level: LogLevel, slug: string, message: string): string {
  const timestamp = new Date().toISOString()
  return `[${timestamp}] [${level.toUpperCase()}] [${slug}] ${message}`
}

export const logger = {
  info(slug: string, message: string): void {
    console.log(formatMessage('info', slug, message))
  },

  warn(slug: string, message: string): void {
    console.warn(formatMessage('warn', slug, message))
  },

  error(slug: string, message: string, err?: unknown): void {
    const errorDetail =
      err instanceof Error ? ` | ${err.message}` : err ? ` | ${String(err)}` : ''
    console.error(formatMessage('error', slug, `${message}${errorDetail}`))
  },

  timing(slug: string, operation: string, startMs: number): void {
    const duration = Date.now() - startMs
    console.log(
      formatMessage('info', slug, `${operation} completed in ${duration}ms`),
    )
  },
}
