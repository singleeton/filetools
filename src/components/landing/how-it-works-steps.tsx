'use client'

import { useEffect, useRef, useState } from 'react'

interface Step {
  icon: React.ReactNode
  number: number
  title: string
  description: string
}

interface HowItWorksStepsProps {
  steps: Step[]
}

/** Reveals the connecting line and steps once scrolled into view, instead of
 * rendering everything statically like the rest of the page always has. */
export function HowItWorksSteps({ steps }: HowItWorksStepsProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setRevealed(true)
        observer.disconnect()
      },
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="relative mx-auto mt-14 grid max-w-3xl gap-10 sm:grid-cols-3">
      <div
        className={`absolute top-8 right-[16.5%] left-[16.5%] hidden h-px origin-left bg-border transition-transform duration-700 ease-out sm:block ${
          revealed ? 'scale-x-100' : 'scale-x-0'
        }`}
      />
      {steps.map((step, i) => (
        <div
          key={step.number}
          className={`relative flex flex-col items-center text-center transition-all duration-500 ease-out ${
            revealed ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
          style={{ transitionDelay: revealed ? `${i * 150 + 200}ms` : '0ms' }}
        >
          <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border bg-background text-primary shadow-sm">
            {step.icon}
          </div>
          <div className="mt-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {step.number}
          </div>
          <h3 className="mt-3 font-semibold">{step.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
        </div>
      ))}
    </div>
  )
}
