'use client'

import { useEffect, useState } from 'react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { NextIntlClientProvider } from 'next-intl'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState({})
  const locale = 'zh'

  useEffect(() => {
    // Load messages dynamically
    import(`../../messages/${locale}.json`).then((m) => setMessages(m.default))
  }, [locale])

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <title>ErWeiMaZens — QR Code Manager</title>
        <meta name="description" content="Create, style, and track your QR codes" />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
