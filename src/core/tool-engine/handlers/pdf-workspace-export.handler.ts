import { PDFDocument, degrees } from 'pdf-lib'
import type { ToolHandler, ToolResult } from '../types'
import { applyOutline, type OutlineNodeInput } from '../lib/pdf-outline'
import { applyPageLabels, type PageLabelRangeInput } from '../lib/pdf-page-labels'

interface WorkspacePageInput {
  sourceIndex: number
  rotation: 0 | 90 | 180 | 270
}

interface WorkspaceExportInput {
  pages: WorkspacePageInput[]
  groups: number[][]
  outputBaseName?: string
  // Bookmarks/page-labels reference positions in the full working page
  // list, so they only apply cleanly to a single-output-file export (the
  // common case: rotate, delete, reorder, or a single extract range) — a
  // multi-way split has no unambiguous way to distribute one outline across
  // several files, so they're skipped when `groups.length > 1`.
  outline?: OutlineNodeInput[]
  pageLabels?: PageLabelRangeInput[]
}

/** Rewrites `targetPosition` from working-list indices to indices within `group`'s output order. */
function remapOutlinePositions(nodes: OutlineNodeInput[], group: number[]): OutlineNodeInput[] {
  return nodes.map((node) => ({
    ...node,
    targetPosition: group.indexOf(node.targetPosition),
    children: remapOutlinePositions(node.children, group),
  }))
}

/**
 * Shared export handler for every `PdfWorkspace`-backed tool (split, rotate,
 * and future page-editor tools). The client always sends the same shape —
 * the full working page list (with per-page rotation) plus output groups
 * (arrays of indices into that list, one array per output file) — regardless
 * of which left-sidebar tool produced the edit. A single group spanning the
 * whole document (as `wholeDocumentGroup` produces) is just a whole-document
 * export; multiple groups are a split.
 */
export const pdfWorkspaceExportHandler: ToolHandler = {
  async execute(files, options): Promise<ToolResult> {
    const input = (options ?? {}) as unknown as WorkspaceExportInput
    const pages = Array.isArray(input.pages) ? input.pages : []
    const groups = Array.isArray(input.groups) ? input.groups : []
    const baseName = input.outputBaseName || 'output'

    if (pages.length === 0 || groups.length === 0) {
      throw new Error('Empty export plan')
    }

    const bytes = new Uint8Array(await files[0].arrayBuffer())
    const sourcePdf = await PDFDocument.load(bytes)
    const totalPages = sourcePdf.getPageCount()

    for (const page of pages) {
      if (page.sourceIndex < 0 || page.sourceIndex >= totalPages) {
        throw new Error('No valid pages selected')
      }
    }

    const outputFiles: NonNullable<Extract<ToolResult, { files: unknown }>['files']> = []

    for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
      const group = groups[groupIndex]
      if (!group || group.length === 0) continue

      const newPdf = await PDFDocument.create()
      const sourceIndices = group.map((i) => pages[i].sourceIndex)
      const copiedPages = await newPdf.copyPages(sourcePdf, sourceIndices)

      copiedPages.forEach((copiedPage, i) => {
        const planPage = pages[group[i]]
        const existing = copiedPage.getRotation().angle
        const combined = (existing + planPage.rotation + 360) % 360
        copiedPage.setRotation(degrees(combined))
        newPdf.addPage(copiedPage)
      })

      // Bookmarks/labels reference positions in the *working* page list —
      // only meaningful for a single-output export, and remapped from
      // working-list positions to positions within this output's page order.
      if (groups.length === 1) {
        if (input.outline && input.outline.length > 0) {
          applyOutline(newPdf, remapOutlinePositions(input.outline, group), copiedPages.map((p) => p.ref))
        }
        if (input.pageLabels && input.pageLabels.length > 0) {
          applyPageLabels(
            newPdf,
            input.pageLabels.map((r) => ({ ...r, fromPosition: group.indexOf(r.fromPosition) })),
            copiedPages.length,
          )
        }
      }

      const resultBytes = await newPdf.save()

      outputFiles.push({
        fileName: groups.length === 1 ? `${baseName}.pdf` : `${baseName}-${groupIndex + 1}.pdf`,
        mimeType: 'application/pdf',
        data: new Uint8Array(resultBytes),
        pageCount: group.length,
      })
    }

    if (outputFiles.length === 0) {
      throw new Error('Empty export plan')
    }

    if (outputFiles.length === 1) {
      const only = outputFiles[0]
      return {
        success: true,
        file: only.data,
        fileName: only.fileName,
        mimeType: only.mimeType,
      }
    }

    return { success: true, files: outputFiles }
  },
}
