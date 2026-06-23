import { Megaphone } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function AdsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ad Management</h1>

      <div className="rounded-xl border bg-card p-12 text-center">
        <Megaphone className="mx-auto h-10 w-10 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Ad Slots</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage ad placements across the site. Add Google AdSense or custom ad codes.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Coming in the next update.
        </p>
      </div>
    </div>
  )
}
