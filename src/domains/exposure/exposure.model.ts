export type ExposureLevel = 'safe' | 'medium' | 'high'

export type ExposureState = {
  score: number
  level: ExposureLevel
}

export function deriveExposureLevel(score: number): ExposureLevel {
  if (score >= 50) return 'high'
  if (score >= 20) return 'medium'
  return 'safe'
}
