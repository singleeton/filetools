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
    const buffer = Buffer.from(await files[0].arrayBuffer())

    let extractedText: string
    try {
      const parser = new PDFParse({ data: new Uint8Array(buffer) })
      const textResult = await parser.getText()
      extractedText = textResult.text
    } catch {
      throw new Error(
        'Could not read this PDF. The file may be corrupted or password-protected.',
      )
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error(
        'No text found in this PDF. It may be a scanned document — text-based PDFs are required.',
      )
    }

    const paragraphs = buildParagraphs(extractedText)

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
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
  const lines = rawText.split('\n')
  const paragraphs: Paragraph[] = []
  let currentBlock: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()

    if (trimmed.length === 0) {
      if (currentBlock.length > 0) {
        paragraphs.push(createParagraph(currentBlock.join(' ')))
        currentBlock = []
      }
      continue
    }

    if (isHeading(trimmed, lines, i)) {
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

  return paragraphs
}

function isHeading(line: string, allLines: string[], index: number): boolean {
  if (line.length > 100 || line.length < 2) return false

  if (line === line.toUpperCase() && /[A-Z]/.test(line) && line.length < 80) {
    return true
  }

  const nextLine = allLines[index + 1]?.trim()
  const prevLine = allLines[index - 1]?.trim()
  if (
    line.length < 60 &&
    !line.endsWith('.') &&
    !line.endsWith(',') &&
    (!prevLine || prevLine.length === 0) &&
    (!nextLine || nextLine.length === 0)
  ) {
    return true
  }

  return false
}

function createHeading(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 28,
        font: 'Calibri',
      }),
    ],
  })
}

function createParagraph(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 200, line: 276 },
    children: [
      new TextRun({
        text,
        size: 24,
        font: 'Calibri',
      }),
    ],
  })
}
