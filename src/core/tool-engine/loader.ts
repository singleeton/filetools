import { registerTool } from './registry'
import { pdfMergeHandler } from './handlers/pdf-merge.handler'
import { pdfSplitHandler } from './handlers/pdf-split.handler'
import { pdfCompressHandler } from './handlers/pdf-compress.handler'
import { wordToPdfHandler } from './handlers/word-to-pdf.handler'
import { pdfToWordHandler } from './handlers/pdf-to-word.handler'
import { pdfToExcelHandler } from './handlers/pdf-to-excel.handler'
import { jpgToPngHandler } from './handlers/jpg-to-png.handler'
import { pngToJpgHandler } from './handlers/png-to-jpg.handler'
import { imageResizeHandler } from './handlers/image-resize.handler'
import { pdfRotateHandler } from './handlers/pdf-rotate.handler'
import { removeBgHandler } from './handlers/remove-bg.handler'

let loaded = false

export function loadAllHandlers(): void {
  if (loaded) return

  registerTool('pdf-merge', pdfMergeHandler)
  registerTool('pdf-split', pdfSplitHandler)
  registerTool('pdf-compress', pdfCompressHandler)
  registerTool('word-to-pdf', wordToPdfHandler)
  registerTool('pdf-to-word', pdfToWordHandler)
  registerTool('pdf-to-excel', pdfToExcelHandler)
  registerTool('jpg-to-png', jpgToPngHandler)
  registerTool('png-to-jpg', pngToJpgHandler)
  registerTool('image-resize', imageResizeHandler)
  registerTool('pdf-rotate', pdfRotateHandler)
  registerTool('remove-bg', removeBgHandler)

  loaded = true
}
