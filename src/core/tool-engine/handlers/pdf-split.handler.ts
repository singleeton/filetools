import { PDFDocument, degrees } from 'pdf-lib'
import type { ToolHandler, ToolResult } from '../types'

interface SplitPageInput {
  sourceIndex: number
  rotation: 0 | 90 | 180 | 270
}

interface SplitInput {
  pages: SplitPageInput[]
  groups: number[][]
}

export const pdfSplitHandler: ToolHandler = {
  async execute(files, options): Promise<ToolResult> {
    const input = (options ?? {}) as unknown as SplitInput
    const pages = Array.isArray(input.pages) ? input.pages : []
    const groups = Array.isArray(input.groups) ? input.groups : []

    if (pages.length === 0 || groups.length === 0) {
      throw new Error('Empty split plan')
    }

    const bytes = new Uint8Array(await files[0].arrayBuffer())
    const sourcePdf = await PDFDocument.load(bytes)
    const totalPages = sourcePdf.getPageCount()

    for (const page of pages) {
      if (page.sourceIndex < 0 || page.sourceIndex >= totalPages) {
        throw new Error('No valid pages selected')
      }
    }

    const outputFiles: NonNullable<Extract<ToolResult, { files: unknown }>['files']> = []

    for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
      const group = groups[groupIndex]
      if (!group || group.length === 0) continue

      const newPdf = await PDFDocument.create()
      const sourceIndices = group.map((i) => pages[i].sourceIndex)
      const copiedPages = await newPdf.copyPages(sourcePdf, sourceIndices)

      copiedPages.forEach((copiedPage, i) => {
        const planPage = pages[group[i]]
        const existing = copiedPage.getRotation().angle
        const combined = (existing + planPage.rotation + 360) % 360
        copiedPage.setRotation(degrees(combined))
        newPdf.addPage(copiedPage)
      })

      const resultBytes = await newPdf.save()

      outputFiles.push({
        fileName: groups.length === 1 ? 'split.pdf' : `split-${groupIndex + 1}.pdf`,
        mimeType: 'application/pdf',
        data: new Uint8Array(resultBytes),
        pageCount: group.length,
      })
    }

    if (outputFiles.length === 0) {
      throw new Error('Empty split plan')
    }

    if (outputFiles.length === 1) {
      const only = outputFiles[0]
      return {
        success: true,
        file: only.data,
        fileName: only.fileName,
        mimeType: only.mimeType,
      }
    }

    return { success: true, files: outputFiles }
  },
}
