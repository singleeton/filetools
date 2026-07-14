import type { ToolCategory } from '@/types/tool'
import { tools } from '@/lib/tools-registry'

export interface CategoryMeta {
  id: ToolCategory
  icon: string
  /** Tailwind classes for the gradient background used on category cards */
  gradient: string
  /** Tailwind classes for solid accent usage (badges, icons, hover borders) */
  accent: string
  /** Tailwind text color class matching the accent */
  text: string
  /** Full literal group-hover text-color classes (kept whole so Tailwind's
   * scanner can find them — never build this by concatenating fragments) */
  hoverText: string
}

// Colors follow familiar file-type conventions (Word=blue, Excel=green, PDF=red)
// so the mapping reads as intuitive rather than arbitrary.
export const categoryMeta: Record<ToolCategory, CategoryMeta> = {
  pdf: {
    id: 'pdf',
    icon: 'FileText',
    gradient: 'from-rose-500 to-red-600',
    accent: 'bg-rose-500',
    text: 'text-rose-600 dark:text-rose-400',
    hoverText: 'group-hover:text-rose-600 dark:group-hover:text-rose-400',
  },
  word: {
    id: 'word',
    icon: 'FileOutput',
    gradient: 'from-blue-500 to-indigo-600',
    accent: 'bg-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
    hoverText: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
  },
  excel: {
    id: 'excel',
    icon: 'Sheet',
    gradient: 'from-emerald-500 to-green-600',
    accent: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    hoverText: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
  },
  image: {
    id: 'image',
    icon: 'Image',
    gradient: 'from-violet-500 to-purple-600',
    accent: 'bg-violet-500',
    text: 'text-violet-600 dark:text-violet-400',
    hoverText: 'group-hover:text-violet-600 dark:group-hover:text-violet-400',
  },
  ai: {
    id: 'ai',
    icon: 'Sparkles',
    gradient: 'from-amber-500 to-orange-600',
    accent: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    hoverText: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
  },
  video: {
    id: 'video',
    icon: 'Video',
    gradient: 'from-pink-500 to-fuchsia-600',
    accent: 'bg-pink-500',
    text: 'text-pink-600 dark:text-pink-400',
    hoverText: 'group-hover:text-pink-600 dark:group-hover:text-pink-400',
  },
  audio: {
    id: 'audio',
    icon: 'AudioLines',
    gradient: 'from-cyan-500 to-sky-600',
    accent: 'bg-cyan-500',
    text: 'text-cyan-600 dark:text-cyan-400',
    hoverText: 'group-hover:text-cyan-600 dark:group-hover:text-cyan-400',
  },
  file: {
    id: 'file',
    icon: 'Archive',
    gradient: 'from-slate-500 to-gray-600',
    accent: 'bg-slate-500',
    text: 'text-slate-600 dark:text-slate-400',
    hoverText: 'group-hover:text-slate-600 dark:group-hover:text-slate-400',
  },
}

// Landing page category-card grid order.
export const categoryOrder: ToolCategory[] = ['pdf', 'word', 'excel', 'image', 'ai', 'video']

// Header nav order — includes audio/file (empty for now) since the nav is
// meant to communicate the full product surface, not just what's shipped.
export const navCategoryOrder: ToolCategory[] = ['pdf', 'image', 'word', 'excel', 'video', 'audio', 'ai', 'file']

export function getCategoryToolCount(category: ToolCategory): number {
  return tools.filter((tool) => tool.category === category).length
}
