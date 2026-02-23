import { getTranslations } from 'next-intl/server'
import QRCreator from '@/components/qr/QRCreator'

export default async function NewQRPage() {
  const t = await getTranslations('qr')
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('create_title')}</h1>
      <QRCreator />
    </div>
  )
}
