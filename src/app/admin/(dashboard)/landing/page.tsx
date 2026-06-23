import { Globe } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function LandingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Landing Page</h1>

      <div className="rounded-xl border bg-card p-12 text-center">
        <Globe className="mx-auto h-10 w-10 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Landing Page CMS</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Edit hero section, features, FAQ, and other landing page content.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Coming in the next update.
        </p>
      </div>
    </div>
  )
}
