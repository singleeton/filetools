type EventName =
  | 'landing_view'
  | 'tool_click'
  | 'upload_start'
  | 'upload_complete'
  | 'conversion_start'
  | 'conversion_complete'
  | 'conversion_error'
  | 'download_click'
  | 'language_switch'

type EventParams = Record<string, string | number | boolean>

export function trackEvent(name: EventName, params?: EventParams): void {
  if (typeof window === 'undefined') return

  // Google Analytics (gtag)
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params)
  }

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${name}`, params || '')
  }
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}
