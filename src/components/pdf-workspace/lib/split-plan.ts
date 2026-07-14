import type { SplitConfig, WorkingPage } from '../types'

/**
 * Derives output groups (arrays of indices into `workingPages`, in output
 * order) from the current working page list and split config. Pure and
 * React-free so it's unit-testable in isolation and reusable across every
 * page-editor-based tool (split, rotate, organize, ...).
 */
export function deriveGroups(workingPages: WorkingPage[], config: SplitConfig): number[][] {
  const total = workingPages.length
  if (total === 0) return []

  switch (config.mode) {
    case 'extract': {
      const selected = new Set(config.selectedIds)
      const indices = workingPages
        .map((page, i) => (selected.has(page.id) ? i : -1))
        .filter((i) => i >= 0)
      return indices.length > 0 ? [indices] : []
    }

    case 'everyPage':
      return workingPages.map((_, i) => [i])

    case 'byRange':
      return config.ranges
        .map((range) => {
          const start = Math.max(1, Math.floor(range.start))
          const end = Math.min(total, Math.floor(range.end))
          if (start > end) return []
          return Array.from({ length: end - start + 1 }, (_, k) => start - 1 + k)
        })
        .filter((group) => group.length > 0)

    case 'everyNPages': {
      const n = Math.max(1, Math.floor(config.n))
      const groups: number[][] = []
      for (let start = 0; start < total; start += n) {
        groups.push(Array.from({ length: Math.min(n, total - start) }, (_, k) => start + k))
      }
      return groups
    }

    case 'custom': {
      const boundaries = Array.from(new Set(config.splitAfterPositions))
        .filter((pos) => pos >= 0 && pos < total - 1)
        .sort((a, b) => a - b)

      const groups: number[][] = []
      let start = 0
      for (const boundary of boundaries) {
        groups.push(Array.from({ length: boundary - start + 1 }, (_, k) => start + k))
        start = boundary + 1
      }
      groups.push(Array.from({ length: total - start }, (_, k) => start + k))
      return groups
    }

    default:
      return []
  }
}

/** A single group spanning the entire working list, in its current order — used by
 * whole-document export tools (rotate, delete, reorder, duplicate) that always
 * produce exactly one output file reflecting the edited page list. */
export function wholeDocumentGroup(workingPages: WorkingPage[]): number[][] {
  return workingPages.length > 0 ? [workingPages.map((_, i) => i)] : []
}
