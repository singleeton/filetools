export type Rotation = 0 | 90 | 180 | 270

export interface WorkingPage {
  id: string
  sourceIndex: number
  // Delta from the source page's native /Rotate value, applied via CSS on
  // the (unrotated) cached thumbnail and composed server-side on export.
  rotation: Rotation
  isDuplicate?: boolean
  label?: string
}

export type SplitMode = 'extract' | 'everyPage' | 'byRange' | 'everyNPages' | 'custom'

export interface SplitRange {
  start: number // 1-based, inclusive, position within the current working order
  end: number
}

export type SplitConfig =
  | { mode: 'extract'; selectedIds: string[] }
  | { mode: 'everyPage' }
  | { mode: 'byRange'; ranges: SplitRange[] }
  | { mode: 'everyNPages'; n: number }
  | { mode: 'custom'; splitAfterPositions: number[] } // 0-based working-list index; boundary after that index

export interface PdfThumbnailInfo {
  dataUrl: string
  width: number
  height: number
}

export type CardSize = 'small' | 'medium' | 'large' | 'xlarge'

export type ZoomPercent = 25 | 50 | 75 | 100 | 125 | 150 | 200
export type FitMode = 'fitWidth' | 'fitHeight' | 'fitScreen'
export type ZoomValue = ZoomPercent | FitMode

export type WorkspaceTool =
  | 'split'
  | 'extract'
  | 'delete'
  | 'rotate'
  | 'duplicate'
  | 'reverse'
  | 'sort'
  | 'select'
  | 'move'
  | 'organize'
  | 'bookmarks'
  | 'pageLabels'

export interface OutlineNode {
  id: string
  title: string
  // Position (0-based) in the *working* page list this bookmark points to.
  targetPosition: number
  children: OutlineNode[]
}

export type PageLabelStyle = 'D' | 'r' | 'R' | 'a' | 'A' // decimal, lower/upper roman, lower/upper alpha

export interface PageLabelRange {
  id: string
  // 0-based position in the working page list where this label range starts.
  fromPosition: number
  style: PageLabelStyle
  prefix: string
  start: number
}
