import type { CodeLabWorkspaceMetadata } from '@/features/code-lab-runner/code-lab.types'

export const WORKSPACE_SCHEMA_VERSION = 1
export const MAX_WORKSPACE_SNAPSHOTS = 8

export type WorkspaceValidationStatus = 'idle' | 'success' | 'failure'

export type WorkspaceValidationResult = {
  status: WorkspaceValidationStatus
  codeLabId: string
  message?: string
}

export type WorkspaceSnapshot = {
  snapshotId: string
  version: number
  codeLabId: string
  missionId: string
  cumulativeStep: number
  parentSnapshotId: string | null
  source: string
  validation: WorkspaceValidationResult
  createdAt: string
}

export type WorkspaceState = {
  schemaVersion: number
  workspaceId: string
  currentSource: string
  currentSnapshotId: string | null
  draft: string
  drafts: Record<string, string>
  currentLabId: string | null
  snapshots: WorkspaceSnapshot[]
  validation: WorkspaceValidationResult | null
  updatedAt: string
}

function createSnapshotId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `snapshot-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function getLatestSnapshot(workspace: WorkspaceState): WorkspaceSnapshot | undefined {
  return workspace.snapshots[workspace.snapshots.length - 1]
}

export function upgradeWorkspaceState(workspace: WorkspaceState | null): WorkspaceState | null {
  if (!workspace) return null

  let parentSnapshotId: string | null = null
  const snapshots = workspace.snapshots.map((snapshot, index) => {
    const upgraded = {
      ...snapshot,
      snapshotId: snapshot.snapshotId ?? createSnapshotId(),
      missionId: snapshot.missionId ?? snapshot.codeLabId,
      cumulativeStep: snapshot.cumulativeStep ?? index + 1,
      parentSnapshotId: snapshot.parentSnapshotId ?? parentSnapshotId,
    }
    parentSnapshotId = upgraded.snapshotId
    return upgraded
  })
  const latest = snapshots[snapshots.length - 1]

  return {
    ...workspace,
    schemaVersion: WORKSPACE_SCHEMA_VERSION,
    currentSource: workspace.currentSource ?? latest?.source ?? workspace.draft,
    currentSnapshotId: workspace.currentSnapshotId ?? latest?.snapshotId ?? null,
    draft: workspace.draft,
    drafts: workspace.drafts ?? {},
    snapshots,
  }
}

export function createWorkspaceState(metadata: CodeLabWorkspaceMetadata, source: string, codeLabId: string, now = new Date().toISOString()): WorkspaceState {
  const initialSource = source || metadata.scaffold
  return {
    schemaVersion: WORKSPACE_SCHEMA_VERSION,
    workspaceId: metadata.workspaceId,
    currentSource: initialSource,
    currentSnapshotId: null,
    draft: initialSource,
    drafts: { [codeLabId]: initialSource },
    currentLabId: null,
    snapshots: [],
    validation: null,
    updatedAt: now,
  }
}

export function selectWorkspaceSource(workspace: WorkspaceState | null, metadata: CodeLabWorkspaceMetadata, template: string, codeLabId: string): string {
  const upgraded = upgradeWorkspaceState(workspace)
  if (!upgraded || upgraded.workspaceId !== metadata.workspaceId) return template || metadata.scaffold
  const labDraft = upgraded.drafts[codeLabId]
  if (labDraft !== undefined) return labDraft
  const labSnapshots = upgraded.snapshots.filter((snapshot) => snapshot.codeLabId === codeLabId)
  const labSnapshot = labSnapshots[labSnapshots.length - 1]
  if (labSnapshot) return labSnapshot.source
  return template || metadata.scaffold
}

export function canCreateWorkspaceSnapshot(workspace: WorkspaceState, metadata: CodeLabWorkspaceMetadata, codeLabId: string): boolean {
  if (workspace.workspaceId !== metadata.workspaceId) return false
  const latest = getLatestSnapshot(workspace)
  const labSnapshots = workspace.snapshots.filter((snapshot) => snapshot.codeLabId === codeLabId)
  const labSnapshot = labSnapshots[labSnapshots.length - 1]
  if (labSnapshot) {
    return labSnapshot.version >= metadata.requiredSnapshotVersion && labSnapshot.cumulativeStep === metadata.cumulativeStep
  }
  return Boolean(latest && latest.version >= metadata.requiredSnapshotVersion && latest.cumulativeStep === metadata.cumulativeStep - 1) ||
    (!latest && metadata.cumulativeStep === 1 && metadata.requiredSnapshotVersion === 0)
}

export function appendWorkspaceSnapshot(
  workspace: WorkspaceState,
  snapshot: Omit<WorkspaceSnapshot, 'snapshotId' | 'version' | 'parentSnapshotId' | 'createdAt'>,
  now = new Date().toISOString(),
): WorkspaceState {
  const latest = getLatestSnapshot(workspace)
  const nextSnapshot: WorkspaceSnapshot = {
    ...snapshot,
    snapshotId: createSnapshotId(),
    version: (workspace.snapshots[workspace.snapshots.length - 1]?.version ?? 0) + 1,
    parentSnapshotId: latest?.snapshotId ?? null,
    createdAt: now,
  }

  return {
    ...workspace,
    currentSource: snapshot.source,
    currentSnapshotId: nextSnapshot.snapshotId,
    draft: snapshot.source,
    drafts: { ...(workspace.drafts ?? {}), [snapshot.codeLabId]: snapshot.source },
    snapshots: [...workspace.snapshots, nextSnapshot].slice(-MAX_WORKSPACE_SNAPSHOTS),
    validation: snapshot.validation,
    updatedAt: now,
  }
}
