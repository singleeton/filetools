import NextImage from 'next/image'

interface ToolShowcaseProps {
  title: string
  description: string
  screenshot: string
  accent: string
  reversed?: boolean
  /** Staggers the float animation so multiple showcases don't bob in sync. */
  index?: number
}

export function ToolShowcase({ title, description, screenshot, accent, reversed, index = 0 }: ToolShowcaseProps) {
  return (
    <div className={`flex flex-col items-center gap-8 lg:flex-row ${reversed ? 'lg:flex-row-reverse' : ''}`}>
      <div className="w-full flex-1">
        <div
          className="animate-float overflow-hidden rounded-2xl border bg-card shadow-xl"
          style={{ animationDelay: `${index * 0.7}s` }}
        >
          <div className="flex items-center gap-1.5 border-b bg-muted/50 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          </div>
          <div className="relative aspect-[16/10] w-full bg-muted/20">
            <NextImage
              src={screenshot}
              alt={title}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-top"
            />
          </div>
        </div>
      </div>
      <div className="w-full flex-1 text-center lg:text-left">
        <span className={`inline-block h-1.5 w-10 rounded-full ${accent}`} />
        <h3 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h3>
        <p className="mt-3 text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
