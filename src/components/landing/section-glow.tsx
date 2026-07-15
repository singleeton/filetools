interface SectionGlowProps {
  /** Tailwind bg-color classes (with opacity), one per blob. 2-3 works best. */
  colors: string[]
}

const positions = [
  'absolute -top-24 left-[10%] h-72 w-72',
  'absolute top-1/3 -right-16 h-80 w-80',
  'absolute -bottom-24 left-1/3 h-72 w-72',
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
