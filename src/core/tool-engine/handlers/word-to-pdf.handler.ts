import mammoth from 'mammoth'
import PDFDocument from 'pdfkit'
import type { ToolHandler, ToolResult } from '../types'

interface DocElement {
  type: string
  tag?: string
  text?: string
  children?: DocElement[]
  isBold?: boolean
  isItalic?: boolean
}

export const wordToPdfHandler: ToolHandler = {
  async execute(files): Promise<ToolResult> {
    const buffer = Buffer.from(await files[0].arrayBuffer())

    const { value: html } = await mammoth.convertToHtml({ buffer })
    const elements = parseHtml(html)

    const pdfBuffer = await generatePdf(elements)

    return {
      success: true,
      file: new Uint8Array(pdfBuffer),
      fileName: files[0].name.replace(/\.(docx?|DOCX?)$/, '.pdf'),
      mimeType: 'application/pdf',
    }
  },
}

function parseHtml(html: string): DocElement[] {
  const elements: DocElement[] = []
  const tagRegex = /<(\/?)(\w+)[^>]*>|([^<]+)/g
  let match: RegExpExecArray | null

  const stack: DocElement[] = []
  let current: DocElement | null = null

  while ((match = tagRegex.exec(html)) !== null) {
    const [, isClosing, tagName, text] = match

    if (text) {
      const trimmed = decodeHtmlEntities(text)
      if (trimmed && current) {
        if (!current.children) current.children = []
        current.children.push({
          type: 'text',
          text: trimmed,
          isBold: stack.some((el) => el.tag === 'strong' || el.tag === 'b'),
          isItalic: stack.some((el) => el.tag === 'em' || el.tag === 'i'),
        })
      }
    } else if (isClosing) {
      const closed = stack.pop()
      if (closed && isBlockTag(closed.tag!)) {
        elements.push(closed)
      }
      current = stack[stack.length - 1] || null
    } else if (tagName) {
      const tag = tagName.toLowerCase()
      const el: DocElement = { type: isBlockTag(tag) ? 'block' : 'inline', tag }

      if (isBlockTag(tag)) {
        stack.push(el)
        current = el
      } else {
        stack.push(el)
        current = stack.find((s) => isBlockTag(s.tag!)) || null
      }
    }
  }

  return elements
}

function isBlockTag(tag: string): boolean {
  return ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'ul', 'ol', 'table', 'tr', 'blockquote'].includes(tag)
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

function generatePdf(elements: DocElement[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 72, bottom: 72, left: 72, right: 72 },
      bufferPages: true,
    })

    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const PAGE_WIDTH = 595.28 - 144

    for (const el of elements) {
      if (!el.children || el.children.length === 0) {
        doc.moveDown(0.3)
        continue
      }

      const fontSize = getFontSize(el.tag)
      const bottomMargin = getBottomMargin(el.tag)

      if (el.tag === 'li') {
        doc.fontSize(fontSize).font('Helvetica').text('•  ', { continued: true })
      }

      for (let i = 0; i < el.children.length; i++) {
        const child = el.children[i]
        if (!child.text) continue

        const font = getFont(child.isBold, child.isItalic)
        const isLast = i === el.children.length - 1

        doc.fontSize(fontSize).font(font).text(child.text, {
          width: PAGE_WIDTH,
          continued: !isLast,
          lineGap: 2,
        })
      }

      doc.moveDown(bottomMargin)
    }

    if (elements.length === 0) {
      doc.fontSize(12).font('Helvetica').text(' ')
    }

    doc.end()
  })
}

function getFontSize(tag?: string): number {
  switch (tag) {
    case 'h1': return 24
    case 'h2': return 20
    case 'h3': return 16
    case 'h4': return 14
    default: return 12
  }
}

function getBottomMargin(tag?: string): number {
  switch (tag) {
    case 'h1': return 0.8
    case 'h2': return 0.6
    case 'h3': return 0.5
    case 'h4': return 0.4
    case 'li': return 0.2
    default: return 0.4
  }
}

function getFont(bold?: boolean, italic?: boolean): string {
  if (bold && italic) return 'Helvetica-BoldOblique'
  if (bold) return 'Helvetica-Bold'
  if (italic) return 'Helvetica-Oblique'
  return 'Helvetica'
}
