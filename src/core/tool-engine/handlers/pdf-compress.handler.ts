import { PDFDocument } from 'pdf-lib'
import type { ToolHandler, ToolResult } from '../types'

type CompressionLevel = 'low' | 'medium' | 'high'

export const pdfCompressHandler: ToolHandler = {
  async execute(files, options): Promise<ToolResult> {
    const level = ((options?.level as string) || 'medium') as CompressionLevel
    const bytes = new Uint8Array(await files[0].arrayBuffer())
    const sourcePdf = await PDFDocument.load(bytes, { ignoreEncryption: true })

    const compressedPdf = await PDFDocument.create()
    const pages = await compressedPdf.copyPages(
      sourcePdf,
      sourcePdf.getPageIndices(),
    )
    pages.forEach((page) => compressedPdf.addPage(page))

    if (level === 'medium' || level === 'high') {
      compressedPdf.setTitle('')
      compressedPdf.setAuthor('')
      compressedPdf.setSubject('')
      compressedPdf.setKeywords([])
      compressedPdf.setProducer('')
      compressedPdf.setCreator('')
    }

    const resultBytes = await compressedPdf.save({
      useObjectStreams: level === 'medium' || level === 'high',
      addDefaultPage: false,
      objectsPerTick: level === 'high' ? 100 : 50,
    })

    return {
      success: true,
      file: new Uint8Array(resultBytes),
      fileName: 'compressed.pdf',
      mimeType: 'application/pdf',
    }
  },
}
