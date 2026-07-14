'use client'

import { Plus, Trash2, ChevronRight, ChevronLeft, Bookmark, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { addNode, flattenOutline, indentNode, outdentNode, removeNode, updateNode } from '../lib/outline-tree'
import type { ImportedOutlineNode } from '../hooks/use-pdf-render-engine'
import type { OutlineNode, WorkingPage } from '../types'

export interface PdfBookmarksPanelLabels {
  title: string
  empty: string
  addBookmark: string
  page: string
  indent: string
  outdent: string
  delete: string
  importExisting: string
}

interface PdfBookmarksPanelProps {
  outline: OutlineNode[]
  onChange: (outline: OutlineNode[]) => void
  workingPages: WorkingPage[]
  selectedPosition: number | null
  importedOutline: ImportedOutlineNode[]
  labels: PdfBookmarksPanelLabels
}

function importedToOutline(nodes: ImportedOutlineNode[], workingPages: WorkingPage[]): OutlineNode[] {
  let uid = 0
  function convert(node: ImportedOutlineNode): OutlineNode | null {
    const targetPosition =
      node.destPageIndex == null ? -1 : workingPages.findIndex((p) => p.sourceIndex === node.destPageIndex)
    uid += 1
    return {
      id: `imported-${uid}`,
      title: node.title,
      targetPosition: targetPosition >= 0 ? targetPosition : 0,
      children: node.items.map(convert).filter((n): n is OutlineNode => n !== null),
    }
  }
  return nodes.map(convert).filter((n): n is OutlineNode => n !== null)
}

export function PdfBookmarksPanel({
  outline,
  onChange,
  workingPages,
  selectedPosition,
  importedOutline,
  labels,
}: PdfBookmarksPanelProps) {
  const rows = flattenOutline(outline)

  function handleAdd() {
    const position = selectedPosition ?? 0
    onChange(addNode(outline, `${labels.page} ${position + 1}`, position))
  }

  return (
    <div className="flex flex-col gap-3 border-b bg-background px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <Bookmark className="size-4" /> {labels.title}
        </div>
        <div className="flex gap-2">
          {importedOutline.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => onChange(importedToOutline(importedOutline, workingPages))}>
              <Download className="size-3.5" /> {labels.importExisting}
            </Button>
          )}
          <Button size="sm" onClick={handleAdd}>
            <Plus className="size-3.5" /> {labels.addBookmark}
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">{labels.empty}</p>
      ) : (
        <div className="max-h-48 space-y-1 overflow-y-auto">
          {rows.map(({ node, depth, path }) => (
            <div key={node.id} className="flex items-center gap-1.5" style={{ paddingLeft: depth * 20 }}>
              <button
                type="button"
                onClick={() => onChange(outdentNode(outline, path))}
                disabled={depth === 0}
                title={labels.outdent}
                className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
              >
                <ChevronLeft className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onChange(indentNode(outline, path))}
                disabled={path[path.length - 1] === 0}
                title={labels.indent}
                className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
              >
                <ChevronRight className="size-3.5" />
              </button>
              <input
                value={node.title}
                onChange={(e) => onChange(updateNode(outline, path, { title: e.target.value }))}
                className="min-w-0 flex-1 rounded border bg-background px-2 py-1 text-xs"
              />
              <span className="shrink-0 text-xs text-muted-foreground">{labels.page}</span>
              <input
                type="number"
                min={1}
                max={workingPages.length}
                value={node.targetPosition + 1}
                onChange={(e) =>
                  onChange(
                    updateNode(outline, path, {
                      targetPosition: Math.max(0, Math.min(workingPages.length - 1, (parseInt(e.target.value, 10) || 1) - 1)),
                    }),
                  )
                }
                className="w-14 shrink-0 rounded border bg-background px-1.5 py-1 text-xs"
              />
              <button
                type="button"
                onClick={() => onChange(removeNode(outline, path))}
                title={labels.delete}
                className="shrink-0 rounded p-1 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
