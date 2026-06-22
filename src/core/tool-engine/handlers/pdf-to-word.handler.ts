import { PDFParse } from 'pdf-parse'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from 'docx'
import type { ToolHandler, ToolResult } from '../types'

export const pdfToWordHandler: ToolHandler = {
  async execute(files): Promise<ToolResult> {
    const bytes = new Uint8Array(await files[0].arrayBuffer())

    let extractedText: string
    let pageCount: number
    try {
      const parser = new PDFParse({ data: bytes })
      const textResult = await parser.getText()
      extractedText = textResult.text
      pageCount = textResult.total
    } catch (err) {
      console.error('[pdf-to-word] extraction error:', err)
      throw new Error(
        'Could not read this PDF. The file may be corrupted or password-protected.',
      )
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error(
        'No extractable text found in this PDF. It may be a scanned/image-based document.',
      )
    }

    console.log(`[pdf-to-word] Extracted ${extractedText.length} chars from ${pageCount} pages`)

    const paragraphs = buildParagraphs(extractedText)

    const doc = new Document({
      compatibility: {
        doNotExpandShiftReturn: true,
      },
      sections: [
        {
          properties: {
            page: {
              margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
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

function buildParagraphs(rawText: string): Paragraph[] {
  const cleanText = rawText.replace(/-- \d+ of \d+ --/g, '').trim()
  const lines = cleanText.split('\n')
  const paragraphs: Paragraph[] = []
  let currentBlock: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.length === 0) {
      if (currentBlock.length > 0) {
        paragraphs.push(createParagraph(currentBlock.join(' ')))
        currentBlock = []
      }
      continue
    }

    if (isHeading(trimmed)) {
      if (currentBlock.length > 0) {
        paragraphs.push(createParagraph(currentBlock.join(' ')))
        currentBlock = []
      }
      paragraphs.push(createHeading(trimmed))
      continue
    }

    currentBlock.push(trimmed)
  }

  if (currentBlock.length > 0) {
    paragraphs.push(createParagraph(currentBlock.join(' ')))
  }

  return paragraphs.length > 0 ? paragraphs : [createParagraph(rawText.trim())]
}

function isHeading(line: string): boolean {
  if (line.length > 100 || line.length < 2) return false
  if (line === line.toUpperCase() && /[A-Z]/.test(line) && line.length < 80) {
    return true
  }
  return false
}

function createHeading(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, size: 28, font: 'Calibri' })],
  })
}

function createParagraph(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 200, line: 276 },
    children: [new TextRun({ text, size: 24, font: 'Calibri' })],
  })
}
