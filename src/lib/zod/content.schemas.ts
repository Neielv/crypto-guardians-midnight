import { z } from 'zod'

export const moduleIdSchema = z.enum(['m0', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7'])
export const nonEmptyStringSchema = z.string().trim().min(1)

export const moduleDefinitionSchema = z.object({
  moduleId: moduleIdSchema,
  title: nonEmptyStringSchema,
  summary: nonEmptyStringSchema,
  concepts: z.array(nonEmptyStringSchema).min(1),
  unlocks: moduleIdSchema.nullable(),
  narrativeTitle: nonEmptyStringSchema.optional(),
  technicalTitle: nonEmptyStringSchema.optional(),
  dramaticDescription: nonEmptyStringSchema.optional(),
  introScene: nonEmptyStringSchema.optional(),
  introImage: nonEmptyStringSchema.optional(),
  startButtonLabel: nonEmptyStringSchema.optional(),
})

export const slideDefinitionSchema = z.object({
  slideId: nonEmptyStringSchema,
  lessonId: nonEmptyStringSchema,
  moduleId: moduleIdSchema,
  order: z.number().int().min(1),
  title: nonEmptyStringSchema,
  text: nonEmptyStringSchema,
  visualHint: nonEmptyStringSchema.optional(),
  image: nonEmptyStringSchema.optional(),
})

export const supportMaterialDefinitionSchema = z.object({
  supportMaterialId: nonEmptyStringSchema,
  slideId: nonEmptyStringSchema,
  lessonId: nonEmptyStringSchema,
  moduleId: moduleIdSchema,
  sourceChapter: nonEmptyStringSchema,
  sourceSection: nonEmptyStringSchema,
  title: nonEmptyStringSchema,
  excerpts: z.array(nonEmptyStringSchema).min(1),
  codeBlocks: z.array(
    z.object({
      title: nonEmptyStringSchema,
      code: nonEmptyStringSchema,
    }),
  ).optional(),
})

const slidesStepSchema = z.object({ stepId: nonEmptyStringSchema, type: z.literal('slides'), slideIds: z.array(nonEmptyStringSchema).min(1) })
const challengeStepSchema = z.object({ stepId: nonEmptyStringSchema, type: z.literal('challenge'), challengeId: nonEmptyStringSchema })
const codeLabStepSchema = z.object({ stepId: nonEmptyStringSchema, type: z.literal('code_lab'), codeLabId: nonEmptyStringSchema })

export const lessonDefinitionSchema = z.object({
  lessonId: nonEmptyStringSchema,
  moduleId: moduleIdSchema,
  title: nonEmptyStringSchema,
  objective: nonEmptyStringSchema,
  narrativeIntro: nonEmptyStringSchema.optional(),
  steps: z.array(z.discriminatedUnion('type', [slidesStepSchema, challengeStepSchema, codeLabStepSchema])).min(1),
})

const challengeBaseSchema = z.object({
  challengeId: nonEmptyStringSchema,
  moduleId: moduleIdSchema,
  lessonId: nonEmptyStringSchema,
  title: nonEmptyStringSchema,
  instructions: nonEmptyStringSchema,
  successCriteria: nonEmptyStringSchema,
  narrativeIntro: nonEmptyStringSchema.optional(),
  successMessage: nonEmptyStringSchema.optional(),
  failureMessage: nonEmptyStringSchema.optional(),
  hints: z.array(nonEmptyStringSchema).optional(),
  maxAttempts: z.number().int().min(1).max(10).optional(),
})

export const challengeDefinitionSchema = z.discriminatedUnion('type', [
  challengeBaseSchema.extend({
    type: z.literal('trivia'),
    payload: z.object({
      question: nonEmptyStringSchema,
      options: z.array(z.object({ id: nonEmptyStringSchema, label: nonEmptyStringSchema })).min(2),
      correctOptionId: nonEmptyStringSchema,
    }),
  }),
  challengeBaseSchema.extend({
    type: z.literal('visibility_editor'),
    payload: z.object({
      fields: z.array(
        z.object({
          id: nonEmptyStringSchema,
          label: nonEmptyStringSchema,
          expectedVisibility: z.enum(['public', 'private']),
        }),
      ).min(1),
    }),
  }),
  challengeBaseSchema.extend({
    type: z.literal('drag_and_drop'),
    payload: z.object({
      items: z.array(z.object({ id: nonEmptyStringSchema, label: nonEmptyStringSchema })).min(1),
      zones: z.array(z.object({ id: nonEmptyStringSchema, label: nonEmptyStringSchema })).min(1),
      validAssignments: z.record(nonEmptyStringSchema, nonEmptyStringSchema),
    }),
  }),
])

const codeLabValidationMetadataSchema = z.object({
  validationMode: z.enum(['exact', 'partial', 'flexible']).optional(),
  expectedTokens: z.array(nonEmptyStringSchema).optional(),
  acceptableAnswers: z.array(nonEmptyStringSchema).optional(),
  normalizeWhitespace: z.boolean().optional(),
})

const codeLabBaseSchema = z.object({
  codeLabId: nonEmptyStringSchema,
  moduleId: moduleIdSchema,
  lessonId: nonEmptyStringSchema,
  title: nonEmptyStringSchema,
  instructions: nonEmptyStringSchema,
  successCriteria: nonEmptyStringSchema,
  narrativeIntro: nonEmptyStringSchema.optional(),
  successMessage: nonEmptyStringSchema.optional(),
  failureMessage: nonEmptyStringSchema.optional(),
  validation: codeLabValidationMetadataSchema.optional(),
  hints: z.array(nonEmptyStringSchema).optional(),
  maxAttempts: z.number().int().min(1).max(10).optional(),
})

export const codeLabDefinitionSchema = z.discriminatedUnion('type', [
  codeLabBaseSchema.extend({
    type: z.literal('fill_in_the_blank'),
    payload: z.object({
      template: nonEmptyStringSchema,
      blanks: z.array(z.object({ id: nonEmptyStringSchema, answer: nonEmptyStringSchema })).min(1),
    }),
  }),
  codeLabBaseSchema.extend({
    type: z.literal('toggle_visibility'),
    payload: z.object({
      fields: z.array(
        z.object({
          id: nonEmptyStringSchema,
          label: nonEmptyStringSchema,
          dataType: nonEmptyStringSchema,
          expectedScope: z.enum(['ledger', 'witness']),
        }),
      ).min(1),
    }),
  }),
])

export const modulesContentSchema = z.array(moduleDefinitionSchema)
export const lessonsContentSchema = z.array(lessonDefinitionSchema)
export const slidesContentSchema = z.array(slideDefinitionSchema)
export const supportMaterialsContentSchema = z.array(supportMaterialDefinitionSchema)
export const challengesContentSchema = z.array(challengeDefinitionSchema)
export const codeLabsContentSchema = z.array(codeLabDefinitionSchema)

export const imagePromptDefinitionSchema = z.object({
  moduleId: moduleIdSchema,
  prompt: nonEmptyStringSchema,
  slideId: nonEmptyStringSchema.optional(),
  lessonId: nonEmptyStringSchema.optional(),
  locale: nonEmptyStringSchema.optional(),
  kind: nonEmptyStringSchema.optional(),
})

export const imagePromptsContentSchema = z.array(imagePromptDefinitionSchema)
