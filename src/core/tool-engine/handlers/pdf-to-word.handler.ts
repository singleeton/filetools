import { PDFDocument } from 'pdf-lib'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from 'docx'
import type { ToolHandler, ToolResult } from '../types'

function decodeHexString(hex: string): string {
  let result = ''
  for (let i = 0; i < hex.length; i += 2) {
    result += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16))
  }
  return result
}

function extractTextFromStream(streamData: string): string {
  const textMatches: string[] = []
  let match: RegExpExecArray | null

  const hexTjRegex = /<([0-9A-Fa-f]+)>\s*Tj/g
  while ((match = hexTjRegex.exec(streamData)) !== null) {
    textMatches.push(decodeHexString(match[1]))
  }

  const parenTjRegex = /\(([^)]*)\)\s*Tj/g
  while ((match = parenTjRegex.exec(streamData)) !== null) {
    textMatches.push(match[1])
  }

  const tjArrayRegex = /\[([^\]]*)\]\s*TJ/gi
  while ((match = tjArrayRegex.exec(streamData)) !== null) {
    const inner = match[1]
    const hexParts = inner.match(/<([0-9A-Fa-f]+)>/g)
    if (hexParts) {
      hexParts.forEach((p) => textMatches.push(decodeHexString(p.slice(1, -1))))
    }
    const parenParts = inner.match(/\(([^)]*)\)/g)
    if (parenParts) {
      parenParts.forEach((p) => textMatches.push(p.slice(1, -1)))
    }
  }

  return textMatches
    .map((t) =>
      t
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\\\/g, '\\'),
    )
    .join(' ')
}

async function extractAllText(pdfBytes: Uint8Array): Promise<string> {
  const { decodePDFRawStream } = await import('pdf-lib')
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
  const pageCount = pdfDoc.getPageCount()
  const texts: string[] = []

  for (let i = 0; i < pageCount; i++) {
    const page = pdfDoc.getPage(i)
    const contentsRef = page.node.Contents()
    if (!contentsRef) continue

    let streamData = ''
    const refs = 'size' in contentsRef
      ? Array.from({ length: (contentsRef as { size(): number }).size() }, (_, j) => (contentsRef as { get(i: number): unknown }).get(j))
      : [contentsRef]

    for (const ref of refs) {
      const stream = page.node.context.lookup(ref as ReturnType<typeof page.node.context.lookup>)
      if (!stream) continue
      try {
        const decoded = decodePDFRawStream(stream as Parameters<typeof decodePDFRawStream>[0])
        const bytes = decoded.decode()
        streamData += Buffer.from(bytes).toString() + '\n'
      } catch {
        // skip undecodable streams
      }
    }

    const text = extractTextFromStream(streamData)
    if (text.trim()) texts.push(text.trim())
  }

  return texts.join('\n\n')
}

export const pdfToWordHandler: ToolHandler = {
  async execute(files): Promise<ToolResult> {
    const bytes = new Uint8Array(await files[0].arrayBuffer())

    let extractedText: string
    try {
      extractedText = await extractAllText(bytes)
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
  const lines = rawText.split('\n')
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

  return paragraphs.length > 0
    ? paragraphs
    : [createParagraph(rawText)]
}

function isHeading(line: string): boolean {
  if (line.length > 100 || line.length < 2) return false
  return line === line.toUpperCase() && /[A-Z]/.test(line) && line.length < 80
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
