import { extractText } from 'unpdf'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from 'docx'
import type { ToolHandler, ToolResult } from '../types'

export const pdfToWordHandler: ToolHandler = {
  async execute(files): Promise<ToolResult> {
    const bytes = new Uint8Array(await files[0].arrayBuffer())

    let pageTexts: string[]
    let pageCount: number
    try {
      const result = await extractText(bytes)
      pageTexts = result.text
      pageCount = result.totalPages
    } catch (err) {
      console.error('[pdf-to-word] extraction error:', err)
      throw new Error(
        'Could not read this PDF. The file may be corrupted or password-protected.',
      )
    }

    const fullText = pageTexts.join('\n\n')

    if (!fullText || fullText.trim().length === 0) {
      throw new Error(
        'No extractable text found in this PDF. It may be a scanned/image-based document.',
      )
    }

    console.log(
      `[pdf-to-word] Extracted ${fullText.length} chars from ${pageCount} pages`,
    )

    const blocks = analyzeDocument(fullText)
    const paragraphs = blocks.flatMap(blockToParagraph)

    const doc = new Document({
      compatibility: { doNotExpandShiftReturn: true },
      styles: {
        paragraphStyles: [
          {
            id: 'Normal',
            name: 'Normal',
            run: { size: 22, font: 'Calibri' },
            paragraph: { spacing: { after: 120, line: 276 } },
          },
        ],
      },
      sections: [
        {
          properties: {
            page: {
              margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
            },
          },
          children: paragraphs,
        },
      ],
    })

    const docxBuffer = await Packer.toBuffer(doc)

    return {
      success: true,
      file: new Uint8Array(docxBuffer),
      fileName: files[0].name.replace(/\.pdf$/i, '.docx'),
      mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }
  },
}

type BlockType =
  | 'title'
  | 'heading'
  | 'subheading'
  | 'paragraph'
  | 'list-item'
  | 'numbered-item'
  | 'contact'
  | 'separator'
  | 'caption'

interface Block {
  type: BlockType
  text: string
  level?: number
}

function analyzeDocument(rawText: string): Block[] {
  const lines = rawText.split('\n')
  const blocks: Block[] = []
  const avgLineLength = calcAvgLength(lines)
  let titleFound = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (trimmed.length === 0) {
      if (blocks.length > 0 && blocks[blocks.length - 1].type !== 'separator') {
        blocks.push({ type: 'separator', text: '' })
      }
      continue
    }

    const prevEmpty = i === 0 || lines[i - 1]?.trim().length === 0
    const nextEmpty = i === lines.length - 1 || lines[i + 1]?.trim().length === 0
    const nextLine = lines[i + 1]?.trim() || ''

    if (!titleFound && i < 5 && isTitle(trimmed, avgLineLength, prevEmpty, nextEmpty)) {
      blocks.push({ type: 'title', text: trimmed })
      titleFound = true
      continue
    }

    if (isListItem(trimmed)) {
      blocks.push({ type: 'list-item', text: cleanListPrefix(trimmed) })
      continue
    }

    if (isNumberedItem(trimmed)) {
      blocks.push({ type: 'numbered-item', text: cleanNumberPrefix(trimmed) })
      continue
    }

    if (isContactLine(trimmed)) {
      blocks.push({ type: 'contact', text: trimmed })
      continue
    }

    if (isHeading(trimmed, avgLineLength, prevEmpty, nextEmpty, nextLine)) {
      const level = getHeadingLevel(trimmed, avgLineLength)
      blocks.push({
        type: level === 1 ? 'heading' : 'subheading',
        text: trimmed.replace(/[:\-–—]+$/, '').trim(),
      })
      continue
    }

    if (isCaption(trimmed, avgLineLength)) {
      blocks.push({ type: 'caption', text: trimmed })
      continue
    }

    blocks.push({ type: 'paragraph', text: trimmed })
  }

  return mergeParagraphs(blocks)
}

function calcAvgLength(lines: string[]): number {
  const nonEmpty = lines.filter((l) => l.trim().length > 0)
  if (nonEmpty.length === 0) return 50
  return nonEmpty.reduce((sum, l) => sum + l.trim().length, 0) / nonEmpty.length
}

function isTitle(line: string, avg: number, prevEmpty: boolean, nextEmpty: boolean): boolean {
  if (line.length > 100) return false
  if (line.length < 3) return false
  if (line.endsWith('.') || line.endsWith(',')) return false
  if (line.length < avg * 0.6 && (prevEmpty || nextEmpty)) return true
  return false
}

function isHeading(
  line: string,
  avg: number,
  prevEmpty: boolean,
  nextEmpty: boolean,
  nextLine: string,
): boolean {
  if (line.length > 80) return false
  if (line.length < 2) return false

  if (line === line.toUpperCase() && /\p{L}/u.test(line) && line.length < 60) {
    return true
  }

  if (
    line.length < avg * 0.5 &&
    !line.endsWith('.') &&
    !line.endsWith(',') &&
    !line.endsWith(';') &&
    prevEmpty &&
    nextLine.length > 0 &&
    !nextEmpty
  ) {
    return true
  }

  if (
    /^\d+[\.\)]\s+\S/.test(line) &&
    line.length < 60 &&
    !line.endsWith('.')
  ) {
    return false
  }

  if (/^(Chapter|Section|Part|Bölüm|Kısım|Глава|Раздел|第)\s+/i.test(line)) {
    return true
  }

  return false
}

function getHeadingLevel(line: string, avg: number): number {
  if (line === line.toUpperCase() && line.length < 40) return 1
  if (line.length < avg * 0.3) return 1
  return 2
}

function isListItem(line: string): boolean {
  return /^[\-•●○◦▪▸→»]\s+/.test(line) || /^[\*]\s+\S/.test(line)
}

function isNumberedItem(line: string): boolean {
  return /^\d{1,3}[\.\)]\s+\S/.test(line) || /^[a-zA-Z][\.\)]\s+\S/.test(line)
}

function cleanListPrefix(line: string): string {
  return line.replace(/^[\-•●○◦▪▸→»\*]\s+/, '')
}

function cleanNumberPrefix(line: string): string {
  return line.replace(/^(\d{1,3}|[a-zA-Z])[\.\)]\s+/, '')
}

function isContactLine(line: string): boolean {
  const patterns = [
    /[\w.\-]+@[\w.\-]+\.\w+/,
    /\+?\d[\d\s\-()]{8,}/,
    /^(Phone|Tel|Email|Fax|Address|Website|URL|Telefon|Adres|E-posta|Телефон|Адрес)[\s:]/i,
    /^https?:\/\//,
    /^www\./i,
  ]
  return patterns.some((p) => p.test(line))
}

function isCaption(line: string, avg: number): boolean {
  if (line.length > avg * 0.7) return false
  return /^(Figure|Table|Image|Chart|Diagram|Şekil|Tablo|Resim|Рисунок|Таблица|图|表)\s*\d/i.test(line)
}

function mergeParagraphs(blocks: Block[]): Block[] {
  const merged: Block[] = []

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]

    if (
      block.type === 'paragraph' &&
      merged.length > 0 &&
      merged[merged.length - 1].type === 'paragraph'
    ) {
      merged[merged.length - 1].text += ' ' + block.text
      continue
    }

    if (block.type === 'separator') {
      if (
        merged.length > 0 &&
        merged[merged.length - 1].type !== 'separator' &&
        i < blocks.length - 1
      ) {
        merged.push(block)
      }
      continue
    }

    merged.push({ ...block })
  }

  return merged
}

function blockToParagraph(block: Block): Paragraph[] {
  switch (block.type) {
    case 'title':
      return [
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { after: 120 },
          children: [
            new TextRun({ text: block.text, bold: true, size: 36, font: 'Calibri' }),
          ],
        }),
      ]

    case 'heading':
      return [
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 80 },
          children: [
            new TextRun({
              text: block.text,
              bold: true,
              size: 28,
              font: 'Calibri',
              color: '2E74B5',
            }),
          ],
        }),
      ]

    case 'subheading':
      return [
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 180, after: 60 },
          children: [
            new TextRun({
              text: block.text,
              bold: true,
              size: 24,
              font: 'Calibri',
              color: '404040',
            }),
          ],
        }),
      ]

    case 'list-item':
      return [
        new Paragraph({
          spacing: { after: 60 },
          indent: { left: 360 },
          children: [
            new TextRun({ text: '•  ', size: 22, font: 'Calibri' }),
            new TextRun({ text: block.text, size: 22, font: 'Calibri' }),
          ],
        }),
      ]

    case 'numbered-item':
      return [
        new Paragraph({
          spacing: { after: 60 },
          indent: { left: 360 },
          children: [
            new TextRun({ text: block.text, size: 22, font: 'Calibri' }),
          ],
        }),
      ]

    case 'contact':
      return [
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: block.text, size: 20, font: 'Calibri', color: '666666' }),
          ],
        }),
      ]

    case 'caption':
      return [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 60, after: 120 },
          children: [
            new TextRun({ text: block.text, size: 20, font: 'Calibri', italics: true, color: '555555' }),
          ],
        }),
      ]

    case 'separator':
      return [
        new Paragraph({
          spacing: { before: 40, after: 40 },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E0E0E0' },
          },
          children: [],
        }),
      ]

    case 'paragraph':
    default:
      return [
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 120, line: 276 },
          children: [
            new TextRun({ text: block.text, size: 22, font: 'Calibri' }),
          ],
        }),
      ]
  }
}
