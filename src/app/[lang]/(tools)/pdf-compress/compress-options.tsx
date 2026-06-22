'use client'

import { cn } from '@/lib/utils'
import { useDictionary } from '@/lib/i18n/dictionary-context'

export type CompressionLevel = 'low' | 'medium' | 'high'

interface CompressOptionsProps {
  level: CompressionLevel
  onLevelChange: (level: CompressionLevel) => void
}

export function CompressOptions({ level, onLevelChange }: CompressOptionsProps) {
  const { dict } = useDictionary()
  const t = dict.compress

  const levels: { value: CompressionLevel; label: string; description: string }[] = [
    { value: 'low', label: t.low, description: t.lowDesc },
    { value: 'medium', label: t.medium, description: t.mediumDesc },
    { value: 'high', label: t.high, description: t.highDesc },
  ]

  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <h3 className="text-sm font-semibold">{t.title}</h3>
      <div className="grid grid-cols-3 gap-3">
        {levels.map((item) => (
          <button
            key={item.value}
            onClick={() => onLevelChange(item.value)}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-lg border p-4 text-center transition-colors',
              level === item.value
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'hover:border-primary/50 hover:bg-accent/50',
            )}
          >
            <span className="text-sm font-medium">{item.label}</span>
            <span className="text-xs text-muted-foreground">{item.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
