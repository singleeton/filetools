'use client'

import { useEffect, useRef } from 'react'

export function AdSlotRenderer({ name, code }: { name: string; code: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = code

    for (const oldScript of Array.from(container.querySelectorAll('script'))) {
      const newScript = document.createElement('script')
      for (const attr of Array.from(oldScript.attributes)) {
        newScript.setAttribute(attr.name, attr.value)
      }
      newScript.textContent = oldScript.textContent
      oldScript.replaceWith(newScript)
    }
  }, [code])

  return <div ref={containerRef} className="ad-slot w-full" data-slot={name} />
}
