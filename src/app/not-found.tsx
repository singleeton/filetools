import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Page not found. The page you are looking for does not exist.
      </p>
      <Link href="/en" className="mt-8">
        <Button size="lg">Go to Homepage</Button>
      </Link>
    </div>
  )
}
