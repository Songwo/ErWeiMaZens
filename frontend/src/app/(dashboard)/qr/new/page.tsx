'use client'

import { useTranslations } from 'next-intl'
import QRCreator from '@/components/qr/QRCreator'

export default function NewQRPage() {
  const t = useTranslations('qr')
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('create_title')}</h1>
      <QRCreator />
    </div>
  )
}
