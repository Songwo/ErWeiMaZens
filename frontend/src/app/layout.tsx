import AppProviders from '@/components/providers/AppProviders'
import './globals.css'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = 'zh'
  const messages = (await import(`../../messages/${locale}.json`)).default

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <title>ErWeiMaZens QR Code Manager</title>
        <meta name="description" content="Create, style, and track your QR codes" />
      </head>
      <body>
        <AppProviders locale={locale} messages={messages}>
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
