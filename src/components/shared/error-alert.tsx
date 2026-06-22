'use client'

import { AlertCircle, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useState } from 'react'

interface ErrorAlertProps {
  message: string
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <Alert variant="destructive" className="relative">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="pr-8">{message}</AlertDescription>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-3 rounded-md p-0.5 transition-colors hover:bg-destructive/20"
      >
        <X className="h-4 w-4" />
      </button>
    </Alert>
  )
}
