import sharp from 'sharp'
import type { ToolHandler, ToolResult } from '../types'

export const removeBgHandler: ToolHandler = {
  async execute(files, options): Promise<ToolResult> {
    const threshold = (options?.threshold as number) || 230
    const buffer = Buffer.from(await files[0].arrayBuffer())

    const { data, info } = await sharp(buffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const pixels = new Uint8Array(data)
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2]
      if (r > threshold && g > threshold && b > threshold) {
        pixels[i + 3] = 0
      }
    }

    const result = await sharp(Buffer.from(pixels), {
      raw: { width: info.width, height: info.height, channels: 4 },
    })
      .png()
      .toBuffer()

    return {
      success: true,
      file: new Uint8Array(result),
      fileName: files[0].name.replace(/\.[^.]+$/, '-nobg.png'),
      mimeType: 'image/png',
    }
  },
}
