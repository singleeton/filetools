import type { BackgroundProvider, RemovalOptions, RemovalResult } from '../types'

// Requires REMOVE_BG_API_KEY environment variable
export class RemoveBgProvider implements BackgroundProvider {
  readonly name = 'remove-bg' as const

  async removeBackground(file: File, _options?: RemovalOptions): Promise<RemovalResult> {
    const apiKey = process.env.NEXT_PUBLIC_REMOVE_BG_API_KEY
    if (!apiKey) throw new Error('NEXT_PUBLIC_REMOVE_BG_API_KEY is not set')

    const formData = new FormData()
    formData.append('image_file', file)
    formData.append('size', 'auto')

    const res = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey },
      body: formData,
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`remove.bg API error: ${res.status} ${text}`)
    }

    const blob = await res.blob()
    return { blob }
  }
}
