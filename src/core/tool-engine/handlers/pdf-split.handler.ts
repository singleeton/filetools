import { PDFDocument } from 'pdf-lib'
import type { ToolHandler, ToolResult } from '../types'

interface SplitOptions {
  mode: 'range' | 'extract' | 'every'
  rangeStart?: number
  rangeEnd?: number
  pages?: number[]
}

export const pdfSplitHandler: ToolHandler = {
  async execute(files, options): Promise<ToolResult> {
    const splitOptions = (options ?? {}) as unknown as SplitOptions
    const bytes = new Uint8Array(await files[0].arrayBuffer())
    const sourcePdf = await PDFDocument.load(bytes)
    const totalPages = sourcePdf.getPageCount()

    const pageIndices = resolvePageIndices(splitOptions, totalPages)

    if (pageIndices.length === 0) {
      throw new Error('No valid pages selected')
    }

    const newPdf = await PDFDocument.create()
    const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices)
    copiedPages.forEach((page) => newPdf.addPage(page))

    const resultBytes = await newPdf.save()

    return {
      success: true,
      file: new Uint8Array(resultBytes),
      fileName: 'split.pdf',
      mimeType: 'application/pdf',
    }
  },
}

function resolvePageIndices(
  options: SplitOptions,
  totalPages: number,
): number[] {
  const { mode = 'range', rangeStart = 1, rangeEnd = totalPages, pages = [] } = options

  switch (mode) {
    case 'extract':
      return pages
        .map((p) => p - 1)
        .filter((i) => i >= 0 && i < totalPages)

    case 'every':
      return Array.from({ length: totalPages }, (_, i) => i)

    case 'range':
    default: {
      const start = Math.max(0, rangeStart - 1)
      const end = Math.min(totalPages, rangeEnd)
      return Array.from({ length: end - start }, (_, i) => start + i)
    }
  }
}
