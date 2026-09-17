import {
  codeLabsContentSchema,
  challengesContentSchema,
  imagePromptsContentSchema,
  lessonsContentSchema,
  modulesContentSchema,
  moduleIdSchema,
  slidesContentSchema,
  supportMaterialsContentSchema,
} from '@/lib/zod/content.schemas'
import type { ChallengeDefinition } from '@/features/challenge-runner/challenge.types'
import type { CodeLabDefinition } from '@/features/code-lab-runner/code-lab.types'
import type { LearningContent } from './learning.model'
import type {
  GameContent,
  ImagePromptDefinition,
  LessonDefinition,
  Locale,
  ModuleDefinition,
  SlideDefinition,
  SupportMaterialDefinition,
} from './learning.types'
import { validateLearningContent, validateLocaleParity, type ValidationIssue } from './content-validator'

export type ContentLoadError = {
  type: 'schema' | 'cross-reference' | 'locale-mismatch'
  message: string
}

export type ContentLoadResult = { ok: true; data: LearningContent; warnings: string[] } | { ok: false; errors: ContentLoadError[] }

const contentGlob = import.meta.glob('../../content/**/*.json', { eager: true })

function resolveGlob<T>(
  locale: Locale,
  moduleId: string | null,
  filename: string,
  glob: Record<string, unknown>
): T | null {
  const suffix = moduleId
    ? `/content/${locale}/modules/${moduleId}/${filename}`
    : `/content/${locale}/${filename}`

  for (const [key, mod] of Object.entries(glob)) {
    const normalizedKey = key.replace(/\\/g, '/')
    if (normalizedKey.endsWith(suffix)) {
      return (mod as { default: T }).default
    }
  }
  return null
}

type LocaleContent = {
  modules: ModuleDefinition[]
  lessons: LessonDefinition[]
  slides: SlideDefinition[]
  supportMaterials: SupportMaterialDefinition[]
  challenges: ChallengeDefinition[]
  codeLabs: CodeLabDefinition[]
  game: GameContent | null
  imagePrompts: ImagePromptDefinition[] | null
}

async function getLocaleContent(locale: Locale): Promise<LocaleContent> {
  const modules: ModuleDefinition[] = []
  const lessons: LessonDefinition[] = []
  const slides: SlideDefinition[] = []
  const supportMaterials: SupportMaterialDefinition[] = []
  const challenges: ChallengeDefinition[] = []
  const codeLabs: CodeLabDefinition[] = []

  for (const moduleId of moduleIdSchema.options) {
    const mod = resolveGlob<ModuleDefinition>(locale, moduleId, 'module.json', contentGlob)
    if (mod) modules.push(mod)

    const modLessons = resolveGlob<LessonDefinition[]>(locale, moduleId, 'lessons.json', contentGlob)
    if (modLessons) lessons.push(...modLessons)

    const modSlides = resolveGlob<SlideDefinition[]>(locale, moduleId, 'slides.json', contentGlob)
    if (modSlides) slides.push(...modSlides)

    const modSupportMaterials = resolveGlob<SupportMaterialDefinition[]>(locale, moduleId, 'support-materials.json', contentGlob)
    if (modSupportMaterials) supportMaterials.push(...modSupportMaterials)

    const modChallenges = resolveGlob<ChallengeDefinition[]>(locale, moduleId, 'challenges.json', contentGlob)
    if (modChallenges) challenges.push(...modChallenges)

    const modCodeLabs = resolveGlob<CodeLabDefinition[]>(locale, moduleId, 'code-labs.json', contentGlob)
    if (modCodeLabs) codeLabs.push(...modCodeLabs)
  }

  const game = resolveGlob<GameContent>(locale, null, 'game/game.json', contentGlob)
  const imagePrompts = resolveGlob<ImagePromptDefinition[]>(locale, null, 'image-prompts.json', contentGlob)

  return {
    modules,
    lessons,
    slides,
    supportMaterials,
    challenges,
    codeLabs,
    game,
    imagePrompts,
  }
}



function mapIssues(issues: ValidationIssue[]): ContentLoadError[] {
  return issues.map((issue) => ({
    type: issue.code.startsWith('LOCALE_') ? 'locale-mismatch' : 'cross-reference',
    message: issue.message,
  }))
}

function parseContent(raw: Awaited<ReturnType<typeof getLocaleContent>>): ContentLoadResult {
  const parsed = {
    modules: modulesContentSchema.safeParse(raw.modules),
    lessons: lessonsContentSchema.safeParse(raw.lessons),
    slides: slidesContentSchema.safeParse(raw.slides),
    supportMaterials: supportMaterialsContentSchema.safeParse(raw.supportMaterials),
    challenges: challengesContentSchema.safeParse(raw.challenges),
    codeLabs: codeLabsContentSchema.safeParse(raw.codeLabs),
    imagePrompts: raw.imagePrompts ? imagePromptsContentSchema.safeParse(raw.imagePrompts) : ({ success: true as const, data: [] as ImagePromptDefinition[] }),
  }

  const errors: ContentLoadError[] = []
  const schemaEntries = [
    ['modules', parsed.modules] as const,
    ['lessons', parsed.lessons] as const,
    ['slides', parsed.slides] as const,
    ['supportMaterials', parsed.supportMaterials] as const,
    ['challenges', parsed.challenges] as const,
    ['codeLabs', parsed.codeLabs] as const,
    ['imagePrompts', parsed.imagePrompts] as const,
  ]
  for (const [key, result] of schemaEntries) {
    if (!result.success) {
      errors.push(...result.error.issues.map((issue) => ({ type: 'schema' as const, message: `${key}: ${issue.message}` })))
    }
  }

  if (errors.length > 0) return { ok: false, errors }

  return {
    ok: true,
    data: {
      modules: parsed.modules.data as LearningContent['modules'],
      lessons: parsed.lessons.data as LearningContent['lessons'],
      slides: parsed.slides.data as LearningContent['slides'],
      supportMaterials: parsed.supportMaterials.data as LearningContent['supportMaterials'],
      challenges: parsed.challenges.data as LearningContent['challenges'],
      codeLabs: parsed.codeLabs.data as LearningContent['codeLabs'],
      imagePrompts: raw.imagePrompts ? (parsed.imagePrompts.data as LearningContent['imagePrompts']) : undefined,
      game: raw.game ?? undefined,
    },
    warnings: [],
  }
}

export async function loadLearningContent(locale: Locale): Promise<ContentLoadResult> {
  const raw = await getLocaleContent(locale)
  const parsed = parseContent(raw)
  if (!parsed.ok) return parsed

  const baseRaw = await getLocaleContent('es')
  const baseParsed = parseContent(baseRaw)
  if (!baseParsed.ok) return baseParsed

  const issues = [...validateLearningContent(parsed.data), ...validateLocaleParity(baseParsed.data, parsed.data)]
  const errors = issues.filter((issue) => issue.severity === 'error')
  const warnings = issues.filter((issue) => issue.severity === 'warning')

  if (errors.length > 0) return { ok: false, errors: mapIssues(errors) }
  return { ok: true, data: parsed.data, warnings: warnings.map((issue) => issue.message) }
}
