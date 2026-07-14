import { FileText, ArrowRight, CheckCircle2 } from 'lucide-react'

interface HeroVisualProps {
  convertedIn: string
  noWatermark: string
  autoDeleted: string
}

export function HeroVisual({ convertedIn, noWatermark, autoDeleted }: HeroVisualProps) {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-rose-500/20 via-violet-500/10 to-blue-500/20 blur-2xl" />
      <div className="animate-float rounded-2xl border bg-card/80 p-6 shadow-xl backdrop-blur-sm sm:p-8">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-1 flex-col items-center gap-2 rounded-xl border bg-background p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
              <FileText className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">document.docx</span>
          </div>

          <ArrowRight className="h-5 w-5 shrink-0 animate-pulse text-primary" />

          <div className="flex flex-1 flex-col items-center gap-2 rounded-xl border bg-background p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
              <FileText className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">document.pdf</span>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-3 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium">{convertedIn}</span>
        </div>
      </div>

      <div className="animate-float-sm absolute -right-4 -top-4 rounded-xl border bg-card px-3 py-2 text-xs font-medium shadow-lg sm:-right-8">
        ✓ {noWatermark}
      </div>
      <div className="animate-drift absolute -bottom-4 -left-4 rounded-xl border bg-card px-3 py-2 text-xs font-medium shadow-lg sm:-left-8">
        ✓ {autoDeleted}
      </div>
    </div>
  )
}
