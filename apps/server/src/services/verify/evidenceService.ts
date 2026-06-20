import type {
  RequiredEvidenceSpec,
  VerifyCheckItem,
  VerifyEvidenceCapturedBy,
  VerifyEvidenceType,
} from '@lobechat/types';
import debug from 'debug';

import { VerifyCheckResultModel } from '@/database/models/verifyCheckResult';
import { VerifyEvidenceModel } from '@/database/models/verifyEvidence';
import { VerifyRunModel } from '@/database/models/verifyRun';
import type { LobeChatDatabase } from '@/database/type';

import { planItemToPendingResult } from './resultSnapshot';

const log = debug('lobe-server:verify-evidence');

/** Read the (optional) evidence requirement a criterion declares on its config. */
export const readRequiredEvidence = (
  config: Record<string, unknown> | undefined | null,
): RequiredEvidenceSpec[] | undefined => {
  const raw = config?.requiredEvidence;
  return Array.isArray(raw) ? (raw as RequiredEvidenceSpec[]) : undefined;
};

/**
 * Which required evidence types are still missing for a criterion — pure, so the
 * structural gate is unit-testable without a database. Returns `[]` when the
 * item declares no evidence requirement (nothing to gate on).
 */
export const coverageGaps = (
  required: RequiredEvidenceSpec[] | undefined,
  evidence: { type: VerifyEvidenceType }[],
): VerifyEvidenceType[] => {
  if (!required?.length) return [];
  const present = new Set(evidence.map((e) => e.type));
  return [...new Set(required.map((r) => r.type))].filter((t) => !present.has(t));
};

export interface RecordEvidenceParams {
  capturedBy?: VerifyEvidenceCapturedBy;
  /** Stable plan-item id (`verify_runs.plan[].id`) the artifact backs. */
  checkItemId: string;
  /** Inline text payload (dom snapshot / console log) — exclusive with `fileId`. */
  content?: string;
  description?: string;
  /** Stored artifact — FK to `files` (already uploaded). Exclusive with `content`. */
  fileId?: string;
  operationId: string;
  type: VerifyEvidenceType;
}

/**
 * Ingestion seam for run-captured evidence. A builder / review agent uploads an
 * artifact keyed by `(operationId, checkItemId)`; this resolves the verification
 * session for the Agent Run, then resolves (or lazily creates) the pending
 * check-result row that artifact backs — evidence binds to a
 * `verify_check_results.id`, not directly to a plan item — then records it.
 *
 * The result row is created on first upload because evidence usually arrives
 * mid-run, before the completion-time executor has materialized any rows.
 */
export class VerifyEvidenceService {
  private readonly runModel: VerifyRunModel;
  private readonly resultModel: VerifyCheckResultModel;
  private readonly evidenceModel: VerifyEvidenceModel;

  constructor(db: LobeChatDatabase, userId: string, workspaceId?: string) {
    this.runModel = new VerifyRunModel(db, userId, workspaceId);
    this.resultModel = new VerifyCheckResultModel(db, userId, workspaceId);
    this.evidenceModel = new VerifyEvidenceModel(db, userId, workspaceId);
  }

  async recordEvidence(params: RecordEvidenceParams) {
    const { operationId, checkItemId, type, content, fileId, capturedBy, description } = params;

    if (!content && !fileId) {
      throw new Error('verify.uploadEvidence: provide one of `content` or `fileId`.');
    }

    const run = await this.runModel.ensureForOperation(operationId);
    const plan = (run.plan ?? []) as VerifyCheckItem[];
    const item = plan.find((i) => i.id === checkItemId);
    if (!item) {
      throw new Error(
        `verify.uploadEvidence: no plan item ${checkItemId} on run for operation ${operationId}.`,
      );
    }

    const result = await this.findOrCreateResult(run.id, operationId, item);

    return this.evidenceModel.create({
      capturedAt: new Date(),
      capturedBy: capturedBy ?? null,
      checkResultId: result.id,
      content: content ?? null,
      description: description ?? null,
      fileId: fileId ?? null,
      type,
    });
  }

  /** List a session's evidence (annotated with checkItemId) for an Agent Run. */
  listEvidence = async (operationId: string) => {
    const run = await this.runModel.findByOperation(operationId);
    if (!run) return [];
    return this.evidenceModel.listByRun(run.id);
  };

  /**
   * Resolve the result row for a plan item, creating the initial `pending` row
   * on first evidence. The `(verifyRunId, checkItemId)` unique index makes the
   * create racy under concurrent uploads, so a unique violation falls back to
   * re-reading the row the competing insert won.
   */
  private async findOrCreateResult(verifyRunId: string, operationId: string, item: VerifyCheckItem) {
    const existing = await this.resultModel.listByRun(verifyRunId);
    const found = existing.find((r) => r.checkItemId === item.id);
    if (found) return found;

    try {
      return await this.resultModel.create(
        planItemToPendingResult(verifyRunId, operationId, item),
      );
    } catch (error) {
      log('result create raced for item %s, re-reading: %O', item.id, error);
      const rows = await this.resultModel.listByRun(verifyRunId);
      const raced = rows.find((r) => r.checkItemId === item.id);
      if (raced) return raced;
      throw error;
    }
  }
}
