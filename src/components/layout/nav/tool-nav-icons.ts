import { createElement, type ReactNode } from 'react'
import {
  FileText, Scissors, FileDown, FileOutput, Merge,
  RotateCw, Image as ImageIcon, Maximize, Eraser, Sheet,
  Sparkles, Video, AudioLines, Archive,
  type LucideIcon,
} from 'lucide-react'

// Returning elements directly (instead of exposing a component reference
// for the caller to assign to a variable and use as `<Icon />`) avoids the
// react-compiler "component created during render" lint error — icon
// lookups here are just data, not a component definition.
const iconMap: Record<string, LucideIcon> = {
  Merge, Scissors, FileDown, FileText, FileOutput, RotateCw,
  Image: ImageIcon, Maximize, Eraser, Sheet,
  Sparkles, Video, AudioLines, Archive,
}

export function renderNavIcon(icon: string, className?: string): ReactNode {
  return createElement(iconMap[icon] ?? FileText, { className })
}
