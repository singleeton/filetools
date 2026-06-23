import sharp from 'sharp'
import type { ToolHandler, ToolResult } from '../types'

export const imageResizeHandler: ToolHandler = {
  async execute(files, options): Promise<ToolResult> {
    const width = (options?.width as number) || undefined
    const height = (options?.height as number) || undefined
    const fit = (options?.fit as string) || 'inside'

    const buffer = Buffer.from(await files[0].arrayBuffer())
    const meta = await sharp(buffer).metadata()

    const result = await sharp(buffer)
      .resize({
        width: width || undefined,
        height: height || undefined,
        fit: fit as 'inside' | 'cover' | 'contain' | 'fill',
        withoutEnlargement: true,
      })
      .toBuffer()

    const ext = meta.format || 'png'
    const mimeMap: Record<string, string> = {
      jpeg: 'image/jpeg', jpg: 'image/jpeg', png: 'image/png',
      webp: 'image/webp', gif: 'image/gif', tiff: 'image/tiff',
    }

    return {
      success: true,
      file: new Uint8Array(result),
      fileName: `resized-${files[0].name}`,
      mimeType: mimeMap[ext] || 'image/png',
    }
  },
}
