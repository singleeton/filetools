'use client'

import { Download, RotateCcw, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDictionary } from '@/lib/i18n/dictionary-context'
import { trackEvent } from '@/lib/analytics'

interface DownloadSectionProps {
  fileName: string
  fileUrl: string
  onReset: () => void
}

export function DownloadSection({
  fileName,
  fileUrl,
  onReset,
}: DownloadSectionProps) {
  const { dict } = useDictionary()

  const handleDownload = () => {
    trackEvent('download_click', { fileName })
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col items-center gap-6 rounded-lg border bg-card p-8">
      <CheckCircle2 className="h-12 w-12 text-green-500" />

      <div className="text-center">
        <h2 className="text-xl font-semibold">{dict.ui.download.ready}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{fileName}</p>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleDownload} size="lg">
          <Download className="mr-2 h-4 w-4" />
          {dict.ui.download.button}
        </Button>
        <Button onClick={onReset} variant="outline" size="lg">
          <RotateCcw className="mr-2 h-4 w-4" />
          {dict.ui.download.startOver}
        </Button>
      </div>
    </div>
  )
}
