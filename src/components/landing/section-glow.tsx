interface SectionGlowProps {
  /** Tailwind bg-color classes (with opacity), one per blob. 2-3 works best. */
  colors: string[]
}

// Kept well inside the section (no negative top/bottom offsets) so a blob
// here never bleeds up against the neighboring section's own blob and reads
// as one blurry mass at the seam.
const positions = [
  'absolute top-8 left-[4%] h-56 w-56',
  'absolute top-1/2 right-[8%] -translate-y-1/2 h-64 w-64',
  'absolute bottom-8 left-[42%] h-56 w-56',
]

/** Soft blurred color blobs for otherwise-flat section backgrounds. Matches
 * the hero's FloatingIcons glow so the color story continues down the page. */
export function SectionGlow({ colors }: SectionGlowProps) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {colors.slice(0, 3).map((color, i) => (
        <div key={i} className={`${positions[i]} rounded-full ${color} blur-3xl`} />
      ))}
    </div>
  )
}
