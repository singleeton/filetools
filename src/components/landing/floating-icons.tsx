import { FileText, Image as ImageIcon, Sheet, Video, FileOutput, Sparkles } from 'lucide-react'

const icons = [
  { Icon: FileText, top: '12%', left: '6%', size: 22, color: 'text-rose-400/40', anim: 'animate-float' },
  { Icon: FileOutput, top: '68%', left: '10%', size: 18, color: 'text-blue-400/40', anim: 'animate-drift' },
  { Icon: Sheet, top: '20%', left: '92%', size: 20, color: 'text-emerald-400/40', anim: 'animate-float-sm' },
  { Icon: ImageIcon, top: '78%', left: '88%', size: 24, color: 'text-violet-400/40', anim: 'animate-float' },
  { Icon: Sparkles, top: '45%', left: '4%', size: 16, color: 'text-amber-400/40', anim: 'animate-float-sm' },
  { Icon: Video, top: '85%', left: '48%', size: 18, color: 'text-pink-400/40', anim: 'animate-drift' },
]

export function FloatingIcons() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute top-1/3 right-0 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />
      {icons.map(({ Icon, top, left, size, color, anim }, i) => (
        <Icon
          key={i}
          aria-hidden
          className={`absolute ${color} ${anim}`}
          style={{ top, left, width: size, height: size, animationDelay: `${i * 0.6}s` }}
        />
      ))}
    </div>
  )
}
