'use client'

import { Accordion } from '@base-ui/react/accordion'
import { ChevronDown } from 'lucide-react'

interface FaqAccordionProps {
  items: { question: string; answer: string }[]
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  return (
    <Accordion.Root className="space-y-3">
      {items.map((item, i) => (
        <Accordion.Item key={i} value={i} className="overflow-hidden rounded-xl border bg-card">
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 px-6 py-4 text-left font-semibold transition-colors hover:bg-muted/50">
              {item.question}
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[panel-open]:rotate-180" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className="h-(--accordion-panel-height) overflow-hidden text-sm text-muted-foreground transition-[height] data-[ending-style]:h-0 data-[starting-style]:h-0">
            <p className="px-6 pb-4">{item.answer}</p>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  )
}
