'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useDictionary } from '@/lib/i18n/dictionary-context'

export type SplitMode = 'range' | 'extract' | 'every'

interface SplitOptionsProps {
  mode: SplitMode
  onModeChange: (mode: SplitMode) => void
  rangeStart: string
  onRangeStartChange: (value: string) => void
  rangeEnd: string
  onRangeEndChange: (value: string) => void
  extractPages: string
  onExtractPagesChange: (value: string) => void
  pageCount: number | null
}

export function SplitOptions(props: SplitOptionsProps) {
  const { dict } = useDictionary()
  const t = dict.split

  return (
    <div className="rounded-lg border bg-card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t.options}</h3>
        {props.pageCount !== null && (
          <span className="text-xs text-muted-foreground">
            {props.pageCount} {t.pagesDetected}
          </span>
        )}
      </div>

      <RadioGroup value={props.mode} onValueChange={(v) => props.onModeChange(v as SplitMode)} className="space-y-3">
        <div className="flex items-start gap-3">
          <RadioGroupItem value="range" id="range" className="mt-0.5" />
          <div className="flex-1 space-y-2">
            <Label htmlFor="range" className="font-medium">{t.pageRange}</Label>
            <p className="text-xs text-muted-foreground">{t.pageRangeDesc}</p>
            {props.mode === 'range' && (
              <div className="flex items-center gap-2">
                <Input type="number" min={1} max={props.pageCount ?? undefined} value={props.rangeStart} onChange={(e) => props.onRangeStartChange(e.target.value)} placeholder={t.from} className="w-24" />
                <span className="text-sm text-muted-foreground">{t.to}</span>
                <Input type="number" min={1} max={props.pageCount ?? undefined} value={props.rangeEnd} onChange={(e) => props.onRangeEndChange(e.target.value)} placeholder={t.to} className="w-24" />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <RadioGroupItem value="extract" id="extract" className="mt-0.5" />
          <div className="flex-1 space-y-2">
            <Label htmlFor="extract" className="font-medium">{t.extractPages}</Label>
            <p className="text-xs text-muted-foreground">{t.extractPagesDesc}</p>
            {props.mode === 'extract' && (
              <Input value={props.extractPages} onChange={(e) => props.onExtractPagesChange(e.target.value)} placeholder="1, 3, 5, 8" className="max-w-xs" />
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <RadioGroupItem value="every" id="every" className="mt-0.5" />
          <div className="flex-1 space-y-2">
            <Label htmlFor="every" className="font-medium">{t.allPages}</Label>
            <p className="text-xs text-muted-foreground">{t.allPagesDesc}</p>
          </div>
        </div>
      </RadioGroup>
    </div>
  )
}
