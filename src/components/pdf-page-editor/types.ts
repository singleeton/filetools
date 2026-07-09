export type Rotation = 0 | 90 | 180 | 270

export interface WorkingPage {
  id: string
  sourceIndex: number
  // Delta from the source page's native /Rotate value, applied via CSS on
  // the (unrotated) cached thumbnail and composed server-side on export.
  rotation: Rotation
  isDuplicate?: boolean
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
