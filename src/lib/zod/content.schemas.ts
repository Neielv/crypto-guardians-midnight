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
  challengeBaseSchema.extend({
    type: z.literal('type_matching'),
    payload: z.object({
      prompts: z.array(z.object({ id: nonEmptyStringSchema, label: nonEmptyStringSchema })).min(2),
      options: z.array(z.object({ id: nonEmptyStringSchema, label: nonEmptyStringSchema })).min(2),
      correctMatches: z.record(nonEmptyStringSchema, nonEmptyStringSchema),
    }).superRefine((payload, context) => {
      const promptIds = payload.prompts.map((prompt) => prompt.id)
      const optionIds = payload.options.map((option) => option.id)
      const promptIdSet = new Set(promptIds)
      const optionIdSet = new Set(optionIds)

      if (promptIdSet.size !== promptIds.length) {
        context.addIssue({
          code: 'custom',
          message: 'prompt IDs must be unique',
          path: ['prompts'],
        })
      }

      if (optionIdSet.size !== optionIds.length) {
        context.addIssue({
          code: 'custom',
          message: 'option IDs must be unique',
          path: ['options'],
        })
      }

      promptIds.forEach((promptId) => {
        if (!(promptId in payload.correctMatches)) {
          context.addIssue({
            code: 'custom',
            message: 'every prompt must have a correct match',
            path: ['correctMatches', promptId],
          })
        }
      })

      Object.entries(payload.correctMatches).forEach(([promptId, optionId]) => {
        if (!promptIdSet.has(promptId)) {
          context.addIssue({
            code: 'custom',
            message: 'correctMatches must reference IDs from prompts',
            path: ['correctMatches', promptId],
          })
        }

        if (!optionIdSet.has(optionId)) {
          context.addIssue({
            code: 'custom',
            message: 'correctMatches must reference IDs from options',
            path: ['correctMatches', promptId],
          })
        }
      })

      const matchedOptionIds = Object.values(payload.correctMatches)
      if (new Set(matchedOptionIds).size !== matchedOptionIds.length) {
        context.addIssue({
          code: 'custom',
          message: 'correct match values must be one-to-one',
          path: ['correctMatches'],
        })
      }
    }),
  }),
  challengeBaseSchema.extend({
    type: z.literal('code_assembly'),
    payload: z.object({
      successMessage: nonEmptyStringSchema.optional(),
      contextLines: z.array(nonEmptyStringSchema).min(1),
      slots: z.array(z.object({ id: nonEmptyStringSchema, label: nonEmptyStringSchema })).min(1),
      pieces: z.array(z.object({ id: nonEmptyStringSchema, label: nonEmptyStringSchema })).min(1),
      correctOrder: z.array(nonEmptyStringSchema).min(1),
    }).superRefine((payload, context) => {
      if (payload.correctOrder.length !== payload.slots.length) {
        context.addIssue({
          code: 'custom',
          message: 'correctOrder must contain one piece ID for each slot',
          path: ['correctOrder'],
        })
      }

      const pieceIds = new Set(payload.pieces.map((piece) => piece.id))
      if (payload.correctOrder.some((pieceId) => !pieceIds.has(pieceId))) {
        context.addIssue({
          code: 'custom',
          message: 'correctOrder must reference IDs from pieces',
          path: ['correctOrder'],
        })
      }
    }),
  }),
  challengeBaseSchema.extend({
    type: z.literal('state_simulation'),
    payload: z.object({
      ledgerLabel: nonEmptyStringSchema,
      initialEntries: z.array(nonEmptyStringSchema),
      survey: z.object({
        title: nonEmptyStringSchema,
        question: nonEmptyStringSchema,
        options: z.array(z.object({ id: nonEmptyStringSchema, label: nonEmptyStringSchema })).min(2),
        identityLabel: nonEmptyStringSchema,
        identityValue: nonEmptyStringSchema,
        nullifierLabel: nonEmptyStringSchema,
        nullifierValue: nonEmptyStringSchema,
      }).superRefine((survey, context) => {
        const optionIds = survey.options.map((option) => option.id)
        if (new Set(optionIds).size !== optionIds.length) {
          context.addIssue({
            code: 'custom',
            message: 'survey option IDs must be unique',
            path: ['options'],
          })
        }
      }),
      routine: z.object({
        lines: z.array(z.object({ id: nonEmptyStringSchema, code: nonEmptyStringSchema })).min(2),
      }).superRefine((routine, context) => {
        const lineIds = routine.lines.map((line) => line.id)
        if (new Set(lineIds).size !== lineIds.length) {
          context.addIssue({
            code: 'custom',
            message: 'routine line IDs must be unique',
            path: ['lines'],
          })
        }
      }),
      attempts: z.array(z.object({
        id: nonEmptyStringSchema,
        title: nonEmptyStringSchema,
        description: nonEmptyStringSchema,
        outcome: z.enum(['accepted', 'rejected']),
        ledgerEntry: z.string().trim(),
        reason: nonEmptyStringSchema,
        completedLineIds: z.array(nonEmptyStringSchema).min(1),
        activeLineId: nonEmptyStringSchema,
      })).min(2),
    }).superRefine((payload, context) => {
      const attemptIds = payload.attempts.map((attempt) => attempt.id)
      if (new Set(attemptIds).size !== attemptIds.length) {
        context.addIssue({
          code: 'custom',
          message: 'attempt IDs must be unique',
          path: ['attempts'],
        })
      }

      if (payload.attempts[0]?.outcome !== 'accepted') {
        context.addIssue({
          code: 'custom',
          message: 'the first attempt must be accepted',
          path: ['attempts', 0, 'outcome'],
        })
      }

      if (payload.attempts[1]?.outcome !== 'rejected') {
        context.addIssue({
          code: 'custom',
          message: 'the second attempt must be rejected',
          path: ['attempts', 1, 'outcome'],
        })
      }

      payload.attempts.forEach((attempt, index) => {
        const lineIds = new Set(payload.routine.lines.map((line) => line.id))
        if (attempt.completedLineIds.some((lineId) => !lineIds.has(lineId))) {
          context.addIssue({
            code: 'custom',
            message: 'completedLineIds must reference IDs from routine.lines',
            path: ['attempts', index, 'completedLineIds'],
          })
        }

        if (!lineIds.has(attempt.activeLineId)) {
          context.addIssue({
            code: 'custom',
            message: 'activeLineId must reference an ID from routine.lines',
            path: ['attempts', index, 'activeLineId'],
          })
        }

        if (attempt.outcome === 'accepted' && attempt.ledgerEntry.length === 0) {
          context.addIssue({
            code: 'custom',
            message: 'accepted attempts must provide a ledger entry',
            path: ['attempts', index, 'ledgerEntry'],
          })
        }

        if (attempt.outcome === 'rejected' && attempt.ledgerEntry.length > 0) {
          context.addIssue({
            code: 'custom',
            message: 'rejected attempts must not provide a ledger entry',
            path: ['attempts', index, 'ledgerEntry'],
          })
        }
      })
    }),
  }),
  challengeBaseSchema.extend({
    type: z.literal('final_assembly'),
    payload: z.object({
      finalSummary: nonEmptyStringSchema,
      stages: z.array(z.object({
        id: nonEmptyStringSchema,
        title: nonEmptyStringSchema,
        description: nonEmptyStringSchema,
        pieces: z.array(z.object({ id: nonEmptyStringSchema, label: nonEmptyStringSchema })).min(2),
        correctPieceId: nonEmptyStringSchema,
        explanation: nonEmptyStringSchema,
      })).min(2),
    }).superRefine((payload, context) => {
      const stageIds = payload.stages.map((stage) => stage.id)
      if (new Set(stageIds).size !== stageIds.length) {
        context.addIssue({
          code: 'custom',
          message: 'stage IDs must be unique',
          path: ['stages'],
        })
      }

      payload.stages.forEach((stage, stageIndex) => {
        const pieceIds = stage.pieces.map((piece) => piece.id)
        if (new Set(pieceIds).size !== pieceIds.length) {
          context.addIssue({
            code: 'custom',
            message: 'piece IDs must be unique within each stage',
            path: ['stages', stageIndex, 'pieces'],
          })
        }

        if (!pieceIds.includes(stage.correctPieceId)) {
          context.addIssue({
            code: 'custom',
            message: 'correctPieceId must reference a piece in its stage',
            path: ['stages', stageIndex, 'correctPieceId'],
          })
        }
      })
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
