import mammoth from 'mammoth'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import type { ToolHandler, ToolResult } from '../types'

interface DocElement {
  tag?: string
  texts: { text: string; bold?: boolean; italic?: boolean }[]
  imageData?: { bytes: Uint8Array; mimeType: 'image/png' | 'image/jpeg' }
}

export const wordToPdfHandler: ToolHandler = {
  async execute(files): Promise<ToolResult> {
    const buffer = Buffer.from(await files[0].arrayBuffer())
    const { value: html } = await mammoth.convertToHtml({ buffer })
    const elements = parseHtml(html)
    const pdfBytes = await generatePdf(elements)

    return {
      success: true,
      file: pdfBytes,
      fileName: files[0].name.replace(/\.(docx|DOCX)$/, '.pdf'),
      mimeType: 'application/pdf',
    }
  },
}

function parseHtml(html: string): DocElement[] {
  const elements: DocElement[] = []
  const tagRegex = /<(\/?)(\w+)([^>]*)>|([^<]+)/g
  let match: RegExpExecArray | null
  const stack: string[] = []
  let current: DocElement | null = null

  while ((match = tagRegex.exec(html)) !== null) {
    const [, isClosing, tagName, attrs, text] = match

    if (text) {
      const decoded = text
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
      if (decoded.trim() && current) {
        current.texts.push({
          text: decoded,
          bold: stack.includes('strong') || stack.includes('b'),
          italic: stack.includes('em') || stack.includes('i'),
        })
      }
    } else if (isClosing && tagName) {
      const tag = tagName.toLowerCase()
      const idx = stack.lastIndexOf(tag)
      if (idx >= 0) stack.splice(idx, 1)
      if (isBlockTag(tag) && current) {
        elements.push(current)
        current = null
      }
    } else if (tagName) {
      const tag = tagName.toLowerCase()

      if (tag === 'img' && attrs) {
        const imgElement = parseImgTag(attrs)
        if (imgElement) {
          if (current) {
            elements.push(current)
            current = null
          }
          elements.push(imgElement)
        }
        continue
      }

      stack.push(tag)
      if (isBlockTag(tag)) {
        current = { tag, texts: [] }
      }
    }
  }

  if (current && current.texts.length > 0) elements.push(current)
  return elements
}

function parseImgTag(attrs: string): DocElement | null {
  const srcMatch = attrs.match(/src\s*=\s*"([^"]*)"/)
  if (!srcMatch) return null

  const src = srcMatch[1]
  const dataMatch = src.match(/^data:(image\/(png|jpeg|jpg));base64,(.+)$/)
  if (!dataMatch) return null

  const mimeType = dataMatch[1] === 'image/jpg' ? 'image/jpeg' : dataMatch[1] as 'image/png' | 'image/jpeg'
  try {
    const bytes = Uint8Array.from(Buffer.from(dataMatch[3], 'base64'))
    return { tag: 'img', texts: [], imageData: { bytes, mimeType } }
  } catch {
    return null
  }
}

function isBlockTag(tag: string): boolean {
  return ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'].includes(tag)
}

async function generatePdf(elements: DocElement[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica)
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)
  const fontItalic = await doc.embedFont(StandardFonts.HelveticaOblique)
  const fontBoldItalic = await doc.embedFont(StandardFonts.HelveticaBoldOblique)

  const PAGE_W = 595.28
  const PAGE_H = 841.89
  const MARGIN = 72
  const CONTENT_W = PAGE_W - MARGIN * 2

  let page = doc.addPage([PAGE_W, PAGE_H])
  let y = PAGE_H - MARGIN

  function getFont(bold?: boolean, italic?: boolean) {
    if (bold && italic) return fontBoldItalic
    if (bold) return fontBold
    if (italic) return fontItalic
    return fontRegular
  }

  function fontSize(tag?: string): number {
    switch (tag) {
      case 'h1': return 22
      case 'h2': return 18
      case 'h3': return 15
      case 'h4': return 13
      default: return 11
    }
  }

  function lineHeight(size: number): number {
    return size * 1.4
  }

  function wrapText(text: string, font: ReturnType<typeof getFont>, size: number): string[] {
    const words = text.split(/\s+/)
    const lines: string[] = []
    let currentLine = ''

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const width = font.widthOfTextAtSize(testLine, size)
      if (width > CONTENT_W && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) lines.push(currentLine)
    return lines.length > 0 ? lines : ['']
  }

  for (const el of elements) {
    if (el.imageData) {
      try {
        const embedded = el.imageData.mimeType === 'image/png'
          ? await doc.embedPng(el.imageData.bytes)
          : await doc.embedJpg(el.imageData.bytes)

        const imgDims = embedded.scale(1)
        let drawW = imgDims.width
        let drawH = imgDims.height

        if (drawW > CONTENT_W) {
          const ratio = CONTENT_W / drawW
          drawW = CONTENT_W
          drawH = imgDims.height * ratio
        }

        const maxImgH = PAGE_H - MARGIN * 2 - 20
        if (drawH > maxImgH) {
          const ratio = maxImgH / drawH
          drawH = maxImgH
          drawW = drawW * ratio
        }

        if (y - drawH < MARGIN) {
          page = doc.addPage([PAGE_W, PAGE_H])
          y = PAGE_H - MARGIN
        }

        page.drawImage(embedded, {
          x: MARGIN,
          y: y - drawH,
          width: drawW,
          height: drawH,
        })

        y -= drawH + 8
      } catch {
        // skip images that can't be embedded
      }
      continue
    }

    if (el.texts.length === 0) {
      y -= 8
      continue
    }

    const size = fontSize(el.tag)
    const lh = lineHeight(size)
    const isHeading = el.tag?.startsWith('h')
    const prefix = el.tag === 'li' ? '•  ' : ''

    const fullText = prefix + el.texts.map((t) => t.text).join('')
    const font = isHeading ? fontBold : getFont(el.texts[0]?.bold, el.texts[0]?.italic)
    const lines = wrapText(fullText, font, size)

    for (const line of lines) {
      if (y - lh < MARGIN) {
        page = doc.addPage([PAGE_W, PAGE_H])
        y = PAGE_H - MARGIN
      }

      page.drawText(line, {
        x: MARGIN,
        y: y - size,
        size,
        font,
        color: rgb(0, 0, 0),
      })

      y -= lh
    }

    y -= isHeading ? 10 : 4
  }

  if (elements.length === 0) {
    page.drawText(' ', { x: MARGIN, y: PAGE_H - MARGIN - 12, size: 12, font: fontRegular })
  }

  const bytes = await doc.save()
  return new Uint8Array(bytes)
}
