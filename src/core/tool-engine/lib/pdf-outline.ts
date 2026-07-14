import { PDFDict, PDFHexString, PDFName, PDFNumber, type PDFDocument, type PDFRef } from 'pdf-lib'

export interface OutlineNodeInput {
  title: string
  // 0-based index into the `pageRefs` array passed to applyOutline.
  targetPosition: number
  children: OutlineNodeInput[]
}

/**
 * Builds a PDF outline (bookmark) tree and attaches it to the document's
 * Catalog. pdf-lib has no high-level API for this — the /Outlines dictionary
 * and its doubly-linked list of item dictionaries (/First, /Last, /Next,
 * /Prev, /Parent, /Count) are constructed directly against the low-level
 * PDFContext, per the PDF spec (ISO 32000-1 §12.3.3).
 *
 * Titles are written as PDFHexString (UTF-16BE) rather than PDFString so
 * non-Latin1 titles (Turkish/Cyrillic/CJK, matching this app's 4 locales)
 * round-trip correctly.
 */
export function applyOutline(pdfDoc: PDFDocument, tree: OutlineNodeInput[], pageRefs: PDFRef[]): void {
  const context = pdfDoc.context

  function filterValid(nodes: OutlineNodeInput[]): OutlineNodeInput[] {
    return nodes
      .filter((n) => n.targetPosition >= 0 && n.targetPosition < pageRefs.length)
      .map((n) => ({ ...n, children: filterValid(n.children) }))
  }

  const validTree = filterValid(tree)
  if (validTree.length === 0) return

  // Pass 1: allocate a ref + empty dict for every node up front, so pass 2
  // can freely link siblings/parents/children regardless of visit order.
  const refByNode = new Map<OutlineNodeInput, PDFRef>()
  function allocate(nodes: OutlineNodeInput[]) {
    for (const node of nodes) {
      refByNode.set(node, context.register(context.obj({})))
      allocate(node.children)
    }
  }
  allocate(validTree)

  function countDescendants(nodes: OutlineNodeInput[]): number {
    return nodes.reduce((sum, n) => sum + 1 + countDescendants(n.children), 0)
  }

  // Pass 2: fill in each dict now that every node's ref exists.
  function linkLevel(nodes: OutlineNodeInput[], parentRef: PDFRef) {
    nodes.forEach((node, i) => {
      const ref = refByNode.get(node)!
      const dict = context.lookup(ref, PDFDict)

      dict.set(PDFName.of('Title'), PDFHexString.fromText(node.title))
      dict.set(PDFName.of('Parent'), parentRef)
      dict.set(PDFName.of('Dest'), context.obj([pageRefs[node.targetPosition], 'Fit']))
      if (i > 0) dict.set(PDFName.of('Prev'), refByNode.get(nodes[i - 1])!)
      if (i < nodes.length - 1) dict.set(PDFName.of('Next'), refByNode.get(nodes[i + 1])!)

      if (node.children.length > 0) {
        dict.set(PDFName.of('First'), refByNode.get(node.children[0])!)
        dict.set(PDFName.of('Last'), refByNode.get(node.children[node.children.length - 1])!)
        // Positive count: descendants are rendered expanded by default.
        dict.set(PDFName.of('Count'), PDFNumber.of(countDescendants(node.children)))
        linkLevel(node.children, ref)
      }
    })
  }

  const rootRef = context.register(context.obj({ Type: 'Outlines' }))
  linkLevel(validTree, rootRef)

  const rootDict = context.lookup(rootRef, PDFDict)
  rootDict.set(PDFName.of('First'), refByNode.get(validTree[0])!)
  rootDict.set(PDFName.of('Last'), refByNode.get(validTree[validTree.length - 1])!)
  rootDict.set(PDFName.of('Count'), PDFNumber.of(countDescendants(validTree)))

  pdfDoc.catalog.set(PDFName.of('Outlines'), rootRef)
}
