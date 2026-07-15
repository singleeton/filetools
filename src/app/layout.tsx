import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { GoogleAnalytics } from '@/components/layout/google-analytics'
import { AdsenseLoader } from '@/components/layout/adsense-loader'
import { ThemeProvider } from '@/components/layout/theme-provider'
import { siteConfig } from '@/lib/site-config'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} - Free Online File Tools`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">
        <ThemeProvider>
          {/* TEMP: remove this before real launch */}
          <div className="fixed top-2 right-2 z-[100] rounded-md bg-black px-2.5 py-1 text-xs font-bold tracking-wide text-white shadow-md">
            BARIŞ
          </div>
          <GoogleAnalytics />
          <AdsenseLoader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
