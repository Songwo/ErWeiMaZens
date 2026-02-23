'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { api } from '@/lib/api'
import type { QRCode } from '@/lib/types'
import QRCreator from '@/components/qr/QRCreator'
import ScanStats from '@/components/qr/ScanStats'

export default function EditQRPage() {
  const t = useTranslations('qr')
  const { id } = useParams<{ id: string }>()
  const [qr, setQR] = useState<QRCode | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.qr.get(id).then(setQR).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="h-64 bg-muted animate-pulse rounded-lg" />
  if (!qr) return <p className="text-muted-foreground">{t('not_found')}</p>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">{t('edit_title')}</h1>
        <QRCreator initial={qr} />
      </div>
      <ScanStats id={id} />
    </div>
  )
}
