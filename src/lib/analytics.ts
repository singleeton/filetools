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

  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params)
  }

  const toolEvents = ['upload_start', 'conversion_start', 'conversion_complete', 'conversion_error', 'download_click']
  if (toolEvents.includes(name) && params?.tool) {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'tool_event',
        data: { tool: params.tool, event: name, ...params },
      }),
    }).catch(() => {})
  }
}

export function trackPageView(path: string, locale?: string): void {
  if (typeof window === 'undefined') return

  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'page_view',
      data: { path, locale, referrer: document.referrer || null },
    }),
  }).catch(() => {})
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}
