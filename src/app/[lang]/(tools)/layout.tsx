import { AdSlot } from '@/components/shared/ad-slot'

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="container mx-auto max-w-3xl px-4 pt-8">
        <AdSlot name="tool-top" />
      </div>
      {children}
      <div className="container mx-auto max-w-3xl px-4 pb-8">
        <AdSlot name="tool-bottom" />
      </div>
    </>
  )
}
