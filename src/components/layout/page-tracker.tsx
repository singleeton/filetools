'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageView } from '@/lib/analytics'

export function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    const locale = pathname.split('/')[1] || 'en'
    trackPageView(pathname, locale)
  }, [pathname])

  return null
}
