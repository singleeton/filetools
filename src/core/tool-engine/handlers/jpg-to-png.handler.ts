import sharp from 'sharp'
import type { ToolHandler, ToolResult } from '../types'

export const jpgToPngHandler: ToolHandler = {
  async execute(files): Promise<ToolResult> {
    const buffer = Buffer.from(await files[0].arrayBuffer())
    const result = await sharp(buffer).png({ quality: 100 }).toBuffer()

    return {
      success: true,
      file: new Uint8Array(result),
      fileName: files[0].name.replace(/\.(jpe?g|JPE?G)$/, '.png'),
      mimeType: 'image/png',
    }
  },
}
