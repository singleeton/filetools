// Standard paper sizes in PDF points (72 dpi), portrait orientation.
const KNOWN_SIZES: { name: string; width: number; height: number }[] = [
  { name: 'A3', width: 842, height: 1191 },
  { name: 'A4', width: 595, height: 842 },
  { name: 'A5', width: 420, height: 595 },
  { name: 'Letter', width: 612, height: 792 },
  { name: 'Legal', width: 612, height: 1008 },
  { name: 'Tabloid', width: 792, height: 1224 },
]

const TOLERANCE = 4

export function guessPageSizeName(widthPt: number, heightPt: number): string {
  const w = Math.min(widthPt, heightPt)
  const h = Math.max(widthPt, heightPt)

  for (const size of KNOWN_SIZES) {
    if (Math.abs(size.width - w) <= TOLERANCE && Math.abs(size.height - h) <= TOLERANCE) {
      return size.name
    }
  }
  return `${Math.round(widthPt)} × ${Math.round(heightPt)} pt`
}
