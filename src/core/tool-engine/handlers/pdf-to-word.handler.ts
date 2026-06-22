import { extractText } from 'unpdf'
import { PDFDocument, PDFName, PDFRawStream } from 'pdf-lib'
import Tesseract from 'tesseract.js'
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

    let fullText = ''

    // 1) Metin tabanlı PDF — hızlı çıkarma
    try {
      const result = await extractText(bytes)
      fullText = result.text.join('\n\n').trim()
      if (fullText.length > 0) {
        console.log(`[pdf-to-word] Text extraction: ${fullText.length} chars`)
      }
    } catch {
      // text extraction failed, will try OCR
    }

    // 2) Metin bulunamadıysa — OCR ile görüntüden oku
    if (fullText.length === 0) {
      console.log('[pdf-to-word] No text found, trying OCR...')
      try {
        fullText = await extractWithOCR(bytes)
        console.log(`[pdf-to-word] OCR extraction: ${fullText.length} chars`)
      } catch (err) {
        console.error('[pdf-to-word] OCR error:', err)
      }
    }

    if (!fullText || fullText.trim().length === 0) {
      throw new Error(
        'Could not extract any text from this PDF. The file may be corrupted or contain only vector graphics.',
      )
    }

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

// --- OCR ---

async function extractWithOCR(pdfBytes: Uint8Array): Promise<string> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
  const images = extractImagesFromPdf(pdfDoc)

  if (images.length === 0) {
    throw new Error('No images found in PDF for OCR')
  }

  const worker = await Tesseract.createWorker(['eng', 'tur'], 1)

  const texts: string[] = []
  for (const imageData of images) {
    try {
      const { data } = await worker.recognize(Buffer.from(imageData))
      if (data.text.trim()) {
        texts.push(data.text.trim())
      }
    } catch {
      // skip unrecognizable images
    }
  }

  await worker.terminate()
  return texts.join('\n\n')
}

function extractImagesFromPdf(pdfDoc: PDFDocument): Uint8Array[] {
  const images: Uint8Array[] = []
  const context = pdfDoc.context

  for (const [, obj] of context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue

    const dict = obj.dict
    if (!dict) continue

    const subtype = dict.get(PDFName.of('Subtype'))
    if (!subtype || subtype.toString() !== '/Image') continue

    const width = getNum(dict, 'Width')
    const height = getNum(dict, 'Height')
    if (!width || !height || width < 100 || height < 100) continue

    const filter = dict.get(PDFName.of('Filter'))?.toString() || ''

    // JPEG images — can be used directly
    if (filter.includes('DCTDecode')) {
      images.push(obj.getContents())
    }
  }

  return images
}

function getNum(dict: { get(name: ReturnType<typeof PDFName.of>): unknown }, key: string): number | null {
  const val = dict.get(PDFName.of(key))
  if (!val) return null
  const num = parseInt(val.toString(), 10)
  return isNaN(num) ? null : num
}

// --- DOCUMENT ANALYSIS ---

type BlockType =
  | 'title'
  | 'heading'
  | 'subheading'
  | 'paragraph'
  | 'list-item'
  | 'numbered-item'
  | 'contact'
  | 'caption'
  | 'separator'

interface Block {
  type: BlockType
  text: string
}

function analyzeDocument(rawText: string): Block[] {
  const lines = rawText.split('\n')
  const blocks: Block[] = []
  const avgLen = calcAvgLength(lines)
  let titleFound = false

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()

    if (trimmed.length === 0) {
      if (blocks.length > 0 && blocks[blocks.length - 1].type !== 'separator') {
        blocks.push({ type: 'separator', text: '' })
      }
      continue
    }

    const prevEmpty = i === 0 || lines[i - 1]?.trim().length === 0
    const nextEmpty = i === lines.length - 1 || lines[i + 1]?.trim().length === 0
    const nextLine = lines[i + 1]?.trim() || ''

    if (!titleFound && i < 5 && isTitle(trimmed, avgLen, prevEmpty, nextEmpty)) {
      blocks.push({ type: 'title', text: trimmed })
      titleFound = true
      continue
    }

    if (isListItem(trimmed)) {
      blocks.push({ type: 'list-item', text: trimmed.replace(/^[\-•●○◦▪▸→»\*]\s+/, '') })
      continue
    }

    if (isNumberedItem(trimmed)) {
      blocks.push({ type: 'numbered-item', text: trimmed })
      continue
    }

    if (isContactLine(trimmed)) {
      blocks.push({ type: 'contact', text: trimmed })
      continue
    }

    if (isHeading(trimmed, avgLen, prevEmpty, nextEmpty, nextLine)) {
      const level = (trimmed === trimmed.toUpperCase() && trimmed.length < 40) ? 'heading' : 'subheading'
      blocks.push({ type: level, text: trimmed.replace(/[:\-–—]+$/, '').trim() })
      continue
    }

    if (isCaption(trimmed)) {
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
  return line.length >= 3 && line.length < 100 && !line.endsWith('.') && line.length < avg * 0.6 && (prevEmpty || nextEmpty)
}

function isHeading(line: string, avg: number, prevEmpty: boolean, _nextEmpty: boolean, nextLine: string): boolean {
  if (line.length > 80 || line.length < 2) return false
  if (line === line.toUpperCase() && /\p{L}/u.test(line) && line.length < 60) return true
  if (line.length < avg * 0.5 && !line.endsWith('.') && !line.endsWith(',') && prevEmpty && nextLine.length > 0) return true
  if (/^(Chapter|Section|Part|Bölüm|Kısım|Глава|Раздел|第)\s+/i.test(line)) return true
  return false
}

function isListItem(line: string): boolean {
  return /^[\-•●○◦▪▸→»\*]\s+/.test(line)
}

function isNumberedItem(line: string): boolean {
  return /^\d{1,3}[\.\)]\s+\S/.test(line) || /^[a-zA-Z][\.\)]\s+\S/.test(line)
}

function isContactLine(line: string): boolean {
  return [/[\w.\-]+@[\w.\-]+\.\w+/, /\+?\d[\d\s\-()]{8,}/, /^(Phone|Tel|Email|Address|Telefon|Adres)[\s:]/i, /^https?:\/\//, /^www\./i]
    .some((p) => p.test(line))
}

function isCaption(line: string): boolean {
  return /^(Figure|Table|Image|Şekil|Tablo|Resim|Рисунок|Таблица|图|表)\s*\d/i.test(line)
}

function mergeParagraphs(blocks: Block[]): Block[] {
  const merged: Block[] = []
  for (const block of blocks) {
    if (block.type === 'paragraph' && merged.length > 0 && merged[merged.length - 1].type === 'paragraph') {
      merged[merged.length - 1].text += ' ' + block.text
    } else if (block.type === 'separator' && merged.length > 0 && merged[merged.length - 1].type === 'separator') {
      continue
    } else {
      merged.push({ ...block })
    }
  }
  return merged
}

// --- DOCX OUTPUT ---

function blockToParagraph(block: Block): Paragraph[] {
  switch (block.type) {
    case 'title':
      return [new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: block.text, bold: true, size: 36, font: 'Calibri' })],
      })]

    case 'heading':
      return [new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 80 },
        children: [new TextRun({ text: block.text, bold: true, size: 28, font: 'Calibri', color: '2E74B5' })],
      })]

    case 'subheading':
      return [new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 180, after: 60 },
        children: [new TextRun({ text: block.text, bold: true, size: 24, font: 'Calibri', color: '404040' })],
      })]

    case 'list-item':
      return [new Paragraph({
        spacing: { after: 60 },
        indent: { left: 360 },
        children: [
          new TextRun({ text: '•  ', size: 22, font: 'Calibri' }),
          new TextRun({ text: block.text, size: 22, font: 'Calibri' }),
        ],
      })]

    case 'numbered-item':
      return [new Paragraph({
        spacing: { after: 60 },
        indent: { left: 360 },
        children: [new TextRun({ text: block.text, size: 22, font: 'Calibri' })],
      })]

    case 'contact':
      return [new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({ text: block.text, size: 20, font: 'Calibri', color: '666666' })],
      })]

    case 'caption':
      return [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 120 },
        children: [new TextRun({ text: block.text, size: 20, font: 'Calibri', italics: true, color: '555555' })],
      })]

    case 'separator':
      return [new Paragraph({
        spacing: { before: 40, after: 40 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E0E0E0' } },
        children: [],
      })]

    default:
      return [new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 120, line: 276 },
        children: [new TextRun({ text: block.text, size: 22, font: 'Calibri' })],
      })]
  }
}
