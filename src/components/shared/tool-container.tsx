import type { ReactNode } from 'react'
import { ToolStructuredData } from './structured-data'
import { RelatedTools } from './related-tools'

interface ToolContainerProps {
  toolId?: string
  title: string
  description: string
  href?: string
  children: ReactNode
}

export function ToolContainer({
  toolId,
  title,
  description,
  href,
  children,
}: ToolContainerProps) {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      {href && (
        <ToolStructuredData name={title} description={description} url={href} />
      )}

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-muted-foreground">{description}</p>
      </div>

      {children}

      {toolId && <RelatedTools currentToolId={toolId} />}
    </div>
  )
}
