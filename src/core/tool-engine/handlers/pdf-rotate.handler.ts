import { PDFDocument, degrees } from 'pdf-lib'
import type { ToolHandler, ToolResult } from '../types'

export const pdfRotateHandler: ToolHandler = {
  async execute(files, options): Promise<ToolResult> {
    const angle = (options?.angle as number) || 90
    const bytes = new Uint8Array(await files[0].arrayBuffer())
    const pdfDoc = await PDFDocument.load(bytes)
    const pages = pdfDoc.getPages()

    for (const page of pages) {
      const current = page.getRotation().angle
      page.setRotation(degrees(current + angle))
    }

    const resultBytes = await pdfDoc.save()

    return {
      success: true,
      file: new Uint8Array(resultBytes),
      fileName: 'rotated.pdf',
      mimeType: 'application/pdf',
    }
  },
}
