import { PDFDocument, PDFName, PDFRawStream, PDFDict, PDFArray, PDFStream } from 'pdf-lib'
import sharp from 'sharp'
import type { ToolHandler, ToolResult } from '../types'

type CompressionLevel = 'low' | 'medium' | 'high'

const QUALITY_MAP: Record<CompressionLevel, number> = {
  low: 80,
  medium: 55,
  high: 30,
}

export const pdfCompressHandler: ToolHandler = {
  async execute(files, options): Promise<ToolResult> {
    const level = ((options?.level as string) || 'medium') as CompressionLevel
    const quality = QUALITY_MAP[level]
    const bytes = new Uint8Array(await files[0].arrayBuffer())
    const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true })

    await compressImages(pdfDoc, quality)

    if (level === 'medium' || level === 'high') {
      pdfDoc.setTitle('')
      pdfDoc.setAuthor('')
      pdfDoc.setSubject('')
      pdfDoc.setKeywords([])
      pdfDoc.setProducer('')
      pdfDoc.setCreator('')
    }

    const resultBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    })

    return {
      success: true,
      file: new Uint8Array(resultBytes),
      fileName: 'compressed.pdf',
      mimeType: 'application/pdf',
    }
  },
}

async function compressImages(
  pdfDoc: PDFDocument,
  quality: number,
): Promise<void> {
  const context = pdfDoc.context

  for (const [ref, obj] of context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream) && !(obj instanceof PDFStream)) continue

    const dict = obj.dict
    if (!dict) continue

    const subtype = dict.get(PDFName.of('Subtype'))
    if (!subtype || subtype.toString() !== '/Image') continue

    const width = getNumericValue(dict, 'Width')
    const height = getNumericValue(dict, 'Height')
    if (!width || !height || width < 10 || height < 10) continue

    const filter = dict.get(PDFName.of('Filter'))
    const filterStr = filter?.toString() || ''

    try {
      let imageBytes: Uint8Array

      if (obj instanceof PDFRawStream) {
        imageBytes = decompressStream(obj, filterStr)
      } else {
        continue
      }

      if (imageBytes.length < 1000) continue

      const bitsPerComponent = getNumericValue(dict, 'BitsPerComponent') || 8
      const colorSpace = dict.get(PDFName.of('ColorSpace'))?.toString() || '/DeviceRGB'
      const channels = colorSpace.includes('Gray') ? 1 : colorSpace.includes('CMYK') ? 4 : 3

      let compressed: Buffer

      if (filterStr.includes('DCTDecode')) {
        compressed = await sharp(Buffer.from(imageBytes))
          .jpeg({ quality, mozjpeg: true })
          .toBuffer()
      } else {
        if (bitsPerComponent !== 8) continue

        const expectedSize = width * height * channels
        if (imageBytes.length < expectedSize) continue

        compressed = await sharp(Buffer.from(imageBytes.slice(0, expectedSize)), {
          raw: { width, height, channels: channels as 1 | 3 | 4 },
        })
          .jpeg({ quality, mozjpeg: true })
          .toBuffer()
      }

      if (compressed.length >= imageBytes.length) continue

      const newStream = context.stream(compressed, {
        ['/Type']: '/XObject',
        ['/Subtype']: '/Image',
        ['/Width']: String(width),
        ['/Height']: String(height),
        ['/ColorSpace']: '/DeviceRGB',
        ['/BitsPerComponent']: '8',
        ['/Filter']: '/DCTDecode',
        ['/Length']: String(compressed.length),
      })

      context.assign(ref, newStream)
    } catch {
      // skip images that can't be processed
    }
  }
}

function getNumericValue(dict: PDFDict, key: string): number | null {
  const val = dict.get(PDFName.of(key))
  if (!val) return null
  const num = parseInt(val.toString(), 10)
  return isNaN(num) ? null : num
}

function decompressStream(stream: PDFRawStream, filter: string): Uint8Array {
  if (filter.includes('FlateDecode')) {
    const pako = require('pako') as typeof import('pako')
    try {
      return pako.inflate(stream.getContents())
    } catch {
      return stream.getContents()
    }
  }
  return stream.getContents()
}
