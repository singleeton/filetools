import { extractText } from 'unpdf'
import * as XLSX from 'xlsx'
import type { ToolHandler, ToolResult } from '../types'

export const pdfToExcelHandler: ToolHandler = {
  async execute(files): Promise<ToolResult> {
    const bytes = new Uint8Array(await files[0].arrayBuffer())

    let pageTexts: string[]
    try {
      const result = await extractText(bytes)
      pageTexts = result.text
    } catch {
      throw new Error('Could not read this PDF.')
    }

    const fullText = pageTexts.join('\n\n')
    if (!fullText.trim()) {
      throw new Error('No extractable text found in this PDF.')
    }

    const rows = parseTextToRows(fullText)
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(rows)
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    return {
      success: true,
      file: new Uint8Array(buffer),
      fileName: files[0].name.replace(/\.pdf$/i, '.xlsx'),
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }
  },
}

function parseTextToRows(text: string): string[][] {
  const lines = text.split('\n').filter((l) => l.trim().length > 0)
  return lines.map((line) => {
    const cells = line.split(/\t|(?:\s{2,})/)
    if (cells.length > 1) return cells.map((c) => c.trim())
    return [line.trim()]
  })
}
