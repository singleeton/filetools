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

  const tabLines = lines.filter((l) => l.includes('\t'))
  if (tabLines.length > lines.length * 0.3) {
    return lines.map((line) => line.split('\t').map((c) => c.trim()))
  }

  const multiSpaceLines = lines.filter((l) => /\s{2,}/.test(l))
  if (multiSpaceLines.length > lines.length * 0.3) {
    const columns = detectColumnPositions(multiSpaceLines)
    if (columns.length > 1) {
      return lines.map((line) => splitByColumns(line, columns))
    }
  }

  return lines.map((line) => {
    const cells = line.split(/\t|(?:\s{3,})/)
    if (cells.length > 1) return cells.map((c) => c.trim())
    return [line.trim()]
  })
}

function detectColumnPositions(lines: string[]): number[] {
  const maxLen = Math.max(...lines.map((l) => l.length))
  const spaceCount = new Array(maxLen).fill(0)

  for (const line of lines) {
    for (let i = 0; i < line.length; i++) {
      if (line[i] === ' ') spaceCount[i]++
    }
  }

  const threshold = lines.length * 0.6
  const gaps: number[] = []
  let inGap = false
  let gapStart = 0

  for (let i = 0; i < maxLen; i++) {
    if (spaceCount[i] >= threshold) {
      if (!inGap) {
        inGap = true
        gapStart = i
      }
    } else {
      if (inGap && i - gapStart >= 2) {
        gaps.push(Math.floor((gapStart + i) / 2))
      }
      inGap = false
    }
  }

  if (gaps.length === 0) return [0]

  return [0, ...gaps]
}

function splitByColumns(line: string, columns: number[]): string[] {
  const cells: string[] = []
  for (let i = 0; i < columns.length; i++) {
    const start = columns[i]
    const end = i + 1 < columns.length ? columns[i + 1] : line.length
    cells.push(line.slice(start, end).trim())
  }
  return cells
}
