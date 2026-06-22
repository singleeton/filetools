import { registerTool } from './registry'
import { pdfMergeHandler } from './handlers/pdf-merge.handler'
import { pdfSplitHandler } from './handlers/pdf-split.handler'
import { pdfCompressHandler } from './handlers/pdf-compress.handler'
import { wordToPdfHandler } from './handlers/word-to-pdf.handler'
import { pdfToWordHandler } from './handlers/pdf-to-word.handler'

let loaded = false

export function loadAllHandlers(): void {
  if (loaded) return

  registerTool('pdf-merge', pdfMergeHandler)
  registerTool('pdf-split', pdfSplitHandler)
  registerTool('pdf-compress', pdfCompressHandler)
  registerTool('word-to-pdf', wordToPdfHandler)
  registerTool('pdf-to-word', pdfToWordHandler)

  loaded = true
}
