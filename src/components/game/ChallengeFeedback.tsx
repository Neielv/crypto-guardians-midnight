import { Badge } from '@/components/ui/Badge'
import { useTranslation } from 'react-i18next'

export function ChallengeFeedback({ result }: { result: 'success' | 'failure' | null }) {
  const { t } = useTranslation('common')

  if (!result) return null
  return result === 'success' ? <Badge tone="success">{t('challenge.success')}</Badge> : <Badge tone="danger">{t('challenge.tryAgain')}</Badge>
}
