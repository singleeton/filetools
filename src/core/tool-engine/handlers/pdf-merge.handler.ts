import { PDFDocument } from 'pdf-lib'
import type { ToolHandler, ToolResult } from '../types'

export const pdfMergeHandler: ToolHandler = {
  async execute(files): Promise<ToolResult> {
    const mergedPdf = await PDFDocument.create()

    for (const file of files) {
      const bytes = new Uint8Array(await file.arrayBuffer())
      const sourcePdf = await PDFDocument.load(bytes)
      const pages = await mergedPdf.copyPages(
        sourcePdf,
        sourcePdf.getPageIndices(),
      )
      pages.forEach((page) => mergedPdf.addPage(page))
    }

    const mergedBytes = await mergedPdf.save()

    return {
      success: true,
      file: new Uint8Array(mergedBytes),
      fileName: 'merged.pdf',
      mimeType: 'application/pdf',
    }
  },
}
