import { extractText } from 'unpdf'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  TabStopPosition,
  TabStopType,
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

    const paragraphs = parseDocument(fullText)

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

interface ParsedBlock {
  type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'contact' | 'separator'
  text: string
}

const SECTION_HEADINGS = [
  'EXPERIENCE', 'EDUCATION', 'SKILLS', 'LANGUAGES', 'REFERENCES',
  'CONTACT', 'SUMMARY', 'OBJECTIVE', 'PROFILE', 'PROJECTS',
  'CERTIFICATIONS', 'AWARDS', 'INTERESTS', 'HOBBIES', 'VOLUNTEER',
  'PUBLICATIONS', 'ACHIEVEMENTS', 'WORK EXPERIENCE', 'PROFESSIONAL EXPERIENCE',
  'DENEYIM', 'EĞİTİM', 'BECERİLER', 'DİLLER', 'REFERANSLAR',
  'İLETİŞİM', 'ÖZET', 'AMAÇ', 'PROFİL', 'PROJELER',
  'SERTİFİKALAR', 'ÖDÜLLER', 'İLGİ ALANLARI', 'GÖNÜLLÜLÜK',
  'İŞ DENEYİMİ', 'MESLEKİ DENEYİM', 'KİŞİSEL BİLGİLER',
  'ОПЫТ', 'ОБРАЗОВАНИЕ', 'НАВЫКИ', 'ЯЗЫКИ', 'КОНТАКТЫ',
  '经验', '教育', '技能', '语言', '联系方式',
]

function isSectionHeading(line: string): boolean {
  const clean = line.trim().replace(/[:\-–—]/g, '').trim()
  if (clean.length < 2 || clean.length > 50) return false

  const upper = clean.toUpperCase()
  if (SECTION_HEADINGS.includes(upper)) return true

  if (clean === clean.toUpperCase() && /[A-ZÀ-ÖÙ-Ýa-zà-öù-ýА-Яа-я]/.test(clean) && clean.length < 40) {
    return true
  }

  return false
}

function isContactLine(line: string): boolean {
  const contactPatterns = [
    /[\w.-]+@[\w.-]+\.\w+/,
    /\+?\d[\d\s\-()]{7,}/,
    /Phone:|Tel:|Email:|Address:|Adres:|Telefon:/i,
  ]
  return contactPatterns.some((p) => p.test(line))
}

function isNameLine(line: string, index: number): boolean {
  if (index > 2) return false
  const words = line.trim().split(/\s+/)
  if (words.length < 2 || words.length > 5) return false
  return words.every((w) => /^[A-ZÀ-ÖÙ-ÝА-Я]/.test(w))
}

function splitIntoSentences(text: string): string[] {
  const parts = text.split(/(?<=[.!?])\s+/)
  const result: string[] = []
  let current = ''

  for (const part of parts) {
    if (current.length + part.length > 120 && current.length > 0) {
      result.push(current.trim())
      current = part
    } else {
      current = current ? `${current} ${part}` : part
    }
  }
  if (current.trim()) result.push(current.trim())
  return result
}

function parseDocument(rawText: string): Paragraph[] {
  const lines = rawText.split('\n')
  const blocks: ParsedBlock[] = []
  let currentText: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (line.length === 0) {
      if (currentText.length > 0) {
        blocks.push({ type: 'paragraph', text: currentText.join(' ') })
        currentText = []
      }
      continue
    }

    if (isNameLine(line, blocks.length)) {
      if (currentText.length > 0) {
        blocks.push({ type: 'paragraph', text: currentText.join(' ') })
        currentText = []
      }
      blocks.push({ type: 'heading1', text: line })
      continue
    }

    if (isSectionHeading(line)) {
      if (currentText.length > 0) {
        blocks.push({ type: 'paragraph', text: currentText.join(' ') })
        currentText = []
      }
      blocks.push({ type: 'separator', text: '' })
      blocks.push({ type: 'heading2', text: line.replace(/[:\-–—]$/, '').trim() })
      continue
    }

    if (isContactLine(line)) {
      if (currentText.length > 0) {
        blocks.push({ type: 'paragraph', text: currentText.join(' ') })
        currentText = []
      }
      blocks.push({ type: 'contact', text: line })
      continue
    }

    currentText.push(line)
  }

  if (currentText.length > 0) {
    blocks.push({ type: 'paragraph', text: currentText.join(' ') })
  }

  return blocks.flatMap(blockToParagraphs)
}

function blockToParagraphs(block: ParsedBlock): Paragraph[] {
  switch (block.type) {
    case 'heading1':
      return [
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: block.text,
              bold: true,
              size: 36,
              font: 'Calibri',
            }),
          ],
        }),
      ]

    case 'heading2':
      return [
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 80 },
          children: [
            new TextRun({
              text: block.text,
              bold: true,
              size: 26,
              font: 'Calibri',
              color: '2E74B5',
            }),
          ],
        }),
      ]

    case 'heading3':
      return [
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 120, after: 60 },
          children: [
            new TextRun({
              text: block.text,
              bold: true,
              size: 24,
              font: 'Calibri',
            }),
          ],
        }),
      ]

    case 'contact':
      return [
        new Paragraph({
          spacing: { after: 40 },
          tabStops: [{ type: TabStopType.LEFT, position: TabStopPosition.MAX }],
          children: [
            new TextRun({
              text: block.text,
              size: 20,
              font: 'Calibri',
              color: '555555',
            }),
          ],
        }),
      ]

    case 'separator':
      return [
        new Paragraph({
          spacing: { before: 60, after: 60 },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
          },
          children: [],
        }),
      ]

    case 'paragraph':
    default: {
      const sentences = splitIntoSentences(block.text)
      return sentences.map(
        (sentence) =>
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 100, line: 276 },
            children: [
              new TextRun({
                text: sentence,
                size: 22,
                font: 'Calibri',
              }),
            ],
          }),
      )
    }
  }
}
