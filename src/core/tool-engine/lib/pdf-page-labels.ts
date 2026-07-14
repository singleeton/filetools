import { PDFArray, PDFHexString, PDFName, type PDFDocument } from 'pdf-lib'

export type PageLabelStyle = 'D' | 'r' | 'R' | 'a' | 'A'

export interface PageLabelRangeInput {
  // 0-based index into the output document's pages.
  fromPosition: number
  style: PageLabelStyle
  prefix: string
  start: number
}

/**
 * Builds a PDF page-labels number tree and attaches it to the document's
 * Catalog (/PageLabels → /Nums, ISO 32000-1 §12.4.2 & §7.9.7). pdf-lib has
 * no PageLabels/NumberTree API, so this is built directly against the
 * low-level PDFContext — a flat /Nums array is valid per spec (a full
 * balanced number tree with /Kids is only required for very large arrays).
 */
export function applyPageLabels(pdfDoc: PDFDocument, ranges: PageLabelRangeInput[], totalPages: number): void {
  const valid = ranges.filter((r) => r.fromPosition >= 0 && r.fromPosition < totalPages)
  if (valid.length === 0) return

  const context = pdfDoc.context
  const sorted = [...valid].sort((a, b) => a.fromPosition - b.fromPosition)

  const nums = PDFArray.withContext(context)
  for (const range of sorted) {
    const fields: Record<string, string | number> = { St: Math.max(1, Math.floor(range.start)) }
    if (range.style) fields.S = range.style

    const labelDict = context.obj(fields)
    if (range.prefix) labelDict.set(PDFName.of('P'), PDFHexString.fromText(range.prefix))

    nums.push(context.obj(range.fromPosition))
    nums.push(labelDict)
  }

  const pageLabelsRef = context.register(context.obj({ Nums: nums }))
  pdfDoc.catalog.set(PDFName.of('PageLabels'), pageLabelsRef)
}
