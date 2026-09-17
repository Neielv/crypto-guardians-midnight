import { Badge } from '@/components/ui/Badge'

export function ChallengeFeedback({ result }: { result: 'success' | 'failure' | null }) {
  if (!result) return null
  return result === 'success' ? <Badge tone="success">Success</Badge> : <Badge tone="danger">Try again</Badge>
}
