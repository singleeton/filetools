import * as pdfjsLib from 'pdfjs-dist'

let configured = false

// Must only be called from client components. Configures the pdf.js worker
// once per page load; the module-level singleton avoids re-resolving the
// worker URL on every hook call.
export function getPdfjs() {
  if (!configured) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString()
    configured = true
  }
  return pdfjsLib
}
