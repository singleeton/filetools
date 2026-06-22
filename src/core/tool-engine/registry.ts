import type { ToolHandler } from './types'

const handlers = new Map<string, ToolHandler>()

export function registerTool(slug: string, handler: ToolHandler): void {
  handlers.set(slug, handler)
}

export function getToolHandler(slug: string): ToolHandler | undefined {
  return handlers.get(slug)
}

export function hasToolHandler(slug: string): boolean {
  return handlers.has(slug)
}

export function getRegisteredSlugs(): string[] {
  return Array.from(handlers.keys())
}
