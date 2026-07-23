import { PDFDocument } from 'pdf-lib'
import type { ToolHandler, ToolResult } from '../types'

interface SignaturePlacement {
  pageIndex: number
  x: number
  y: number
  width: number
  height: number
}

function parseDataUrl(dataUrl: string): { mimeType: 'image/png' | 'image/jpeg'; bytes: Uint8Array } {
  const match = dataUrl.match(/^data:image\/(png|jpe?g);base64,(.+)$/)
  if (!match) throw new Error('Invalid signature image')
  const mimeType = match[1] === 'png' ? 'image/png' : 'image/jpeg'
  return { mimeType, bytes: Uint8Array.from(Buffer.from(match[2], 'base64')) }
}

export const pdfSignHandler: ToolHandler = {
  async execute(files, options): Promise<ToolResult> {
    const { signatureDataUrl, placements } = (options ?? {}) as {
      signatureDataUrl?: string
      placements?: SignaturePlacement[]
    }

    if (!signatureDataUrl || !placements?.length) {
      throw new Error('No signature placements provided')
    }

    const pdfBytes = await files[0].arrayBuffer()
    const doc = await PDFDocument.load(pdfBytes)

    const { mimeType, bytes } = parseDataUrl(signatureDataUrl)
    const embedded = mimeType === 'image/png' ? await doc.embedPng(bytes) : await doc.embedJpg(bytes)

    const pages = doc.getPages()
    for (const placement of placements) {
      const page = pages[placement.pageIndex]
      if (!page) continue
      page.drawImage(embedded, {
        x: placement.x,
        y: placement.y,
        width: placement.width,
        height: placement.height,
      })
    }

    const bytesOut = await doc.save()

    return {
      success: true,
      file: new Uint8Array(bytesOut),
      fileName: files[0].name.replace(/\.pdf$/i, '-signed.pdf'),
      mimeType: 'application/pdf',
    }
  },
}
