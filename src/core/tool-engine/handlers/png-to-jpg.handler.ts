import sharp from 'sharp'
import type { ToolHandler, ToolResult } from '../types'

export const pngToJpgHandler: ToolHandler = {
  async execute(files, options): Promise<ToolResult> {
    const quality = (options?.quality as number) || 90
    const buffer = Buffer.from(await files[0].arrayBuffer())
    const result = await sharp(buffer).jpeg({ quality, mozjpeg: true }).toBuffer()

    return {
      success: true,
      file: new Uint8Array(result),
      fileName: files[0].name.replace(/\.(png|PNG)$/, '.jpg'),
      mimeType: 'image/jpeg',
    }
  },
}
