import type { VerifyCheckItem } from '@lobechat/types';
import { and, desc, eq, gte, isNotNull, isNull, sql } from 'drizzle-orm';

import { today } from '@/utils/time';

import type {
  AgentOperationAppContext,
  AgentOperationError,
  AgentOperationInterruption,
  NewAgentOperation,
} from '../schemas/agentOperations';
import { agentOperations } from '../schemas/agentOperations';
import type { LobeChatDatabase } from '../type';

/** Verify rollup states, mirrors the `verify_status` enum column. */
export type VerifyStatus =
  | 'unverified'
  | 'planned'
  | 'verifying'
  | 'passed'
  | 'failed'
  | 'repairing'
  | 'delivered';

export interface RecordOperationStartParams {
  agentId?: string | null;
  appContext?: AgentOperationAppContext;
  chatGroupId?: string | null;
  maxSteps?: number;
  /**
   * Durable per-run metadata persisted on the operation row (jsonb). Carries the
   * Agent Signal run marker so server-side tools can read it back from the row
   * (`metadata.agentSignal`) at tool-call time.
   */
  metadata?: Record<string, unknown>;
  model?: string;
  modelRuntimeConfig?: Record<string, unknown>;
  operationId: string;
  parentOperationId?: string | null;
  provider?: string;
  startedAt?: Date;
  taskId?: string | null;
  threadId?: string | null;
  topicId?: string | null;
  trigger?: string;
}

export interface RecordOperationCompletionParams {
  completedAt?: Date;
  completionReason?:
    | 'done'
    | 'error'
    | 'interrupted'
    | 'max_steps'
    | 'cost_limit'
    | 'waiting_for_human'
    | 'waiting_for_async_tool';
  cost?: Record<string, unknown> | null;
  error?: AgentOperationError | null;
  interruption?: AgentOperationInterruption | null;
  llmCalls?: number | null;
  processingTimeMs?: number | null;
  status:
    | 'running'
    | 'waiting_for_human'
    | 'waiting_for_async_tool'
    | 'done'
    | 'error'
    | 'interrupted';
  stepCount?: number | null;
  toolCalls?: number | null;
  totalCost?: number | null;
  totalInputTokens?: number | null;
  totalOutputTokens?: number | null;
  totalTokens?: number | null;
  traceS3Key?: string | null;
  usage?: Record<string, unknown> | null;
}

export interface AgentOperationProfileStatsParams {
  agentId: string;
  days?: number;
  recentLimit?: number;
}

export interface AgentOperationDailyStats {
  date: string;
  llmCalls: number;
  operationCount: number;
  processingTimeMs: number;
  toolCalls: number;
  totalCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
}

export interface AgentOperationRecentItem {
  completedAt: Date | null;
  completionReason: string | null;
  createdAt: Date;
  errorMessage?: string;
  id: string;
  llmCalls: number;
  model: string | null;
  processingTimeMs: number;
  provider: string | null;
  startedAt: Date | null;
  status: string;
  stepCount: number;
  toolCalls: number;
  totalCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  trigger: string | null;
}

export interface AgentOperationProfileStats {
  daily: AgentOperationDailyStats[];
  recentOperations: AgentOperationRecentItem[];
  summary: {
    averageDurationMs: number;
    averageStepCount: number;
    completedOperations: number;
    failedOperations: number;
    interruptedOperations: number;
    llmCalls: number;
    operationCount: number;
    successRate: number;
    toolCalls: number;
    totalCost: number;
    totalDurationMs: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalTokens: number;
  };
}

export class AgentOperationModel {
  private readonly db: LobeChatDatabase;
  private readonly userId: string;

  constructor(db: LobeChatDatabase, userId: string) {
    this.db = db;
    this.userId = userId;
  }

  /**
   * Insert the initial row when an operation is created. Idempotent via
   * `onConflictDoNothing` on the primary key so resumed operations don't
   * blow up on the second createOperation call.
   */
  async recordStart(params: RecordOperationStartParams): Promise<void> {
    const values: NewAgentOperation = {
      agentId: params.agentId ?? null,
      appContext: params.appContext,
      chatGroupId: params.chatGroupId ?? null,
      id: params.operationId,
      maxSteps: params.maxSteps,
      ...(params.metadata ? { metadata: params.metadata } : {}),
      model: params.model,
      modelRuntimeConfig: params.modelRuntimeConfig,
      parentOperationId: params.parentOperationId ?? null,
      provider: params.provider,
      startedAt: params.startedAt ?? new Date(),
      status: 'running',
      taskId: params.taskId ?? null,
      threadId: params.threadId ?? null,
      topicId: params.topicId ?? null,
      trigger: params.trigger,
      userId: this.userId,
    };

    await this.db.insert(agentOperations).values(values).onConflictDoNothing();
  }

  /**
   * Update the row when the operation reaches a terminal state. Scoped by
   * `userId` so a leaked operationId can't be used to flip another user's
   * row. No-op when the start row was never written.
   */
  async recordCompletion(
    operationId: string,
    params: RecordOperationCompletionParams,
  ): Promise<void> {
    const updates: Partial<NewAgentOperation> = {
      completionReason: params.completionReason,
      status: params.status,
    };

    // Only set completedAt when explicitly provided so callers can mark a
    // non-terminal status (e.g. waiting_for_human) without falsely stamping
    // completion time.
    if (params.completedAt !== undefined) updates.completedAt = params.completedAt;
    if (params.processingTimeMs !== undefined) updates.processingTimeMs = params.processingTimeMs;
    if (params.stepCount !== undefined) updates.stepCount = params.stepCount;
    if (params.totalCost !== undefined) updates.totalCost = params.totalCost;
    if (params.totalTokens !== undefined) updates.totalTokens = params.totalTokens;
    if (params.totalInputTokens !== undefined) updates.totalInputTokens = params.totalInputTokens;
    if (params.totalOutputTokens !== undefined)
      updates.totalOutputTokens = params.totalOutputTokens;
    if (params.llmCalls !== undefined) updates.llmCalls = params.llmCalls;
    if (params.toolCalls !== undefined) updates.toolCalls = params.toolCalls;
    if (params.cost !== undefined) updates.cost = params.cost;
    if (params.usage !== undefined) updates.usage = params.usage;
    if (params.error !== undefined) updates.error = params.error;
    if (params.interruption !== undefined) updates.interruption = params.interruption;
    if (params.traceS3Key !== undefined) updates.traceS3Key = params.traceS3Key;

    await this.db
      .update(agentOperations)
      .set(updates)
      .where(and(eq(agentOperations.id, operationId), eq(agentOperations.userId, this.userId)));
  }

  async findById(operationId: string) {
    const [row] = await this.db
      .select()
      .from(agentOperations)
      .where(and(eq(agentOperations.id, operationId), eq(agentOperations.userId, this.userId)))
      .limit(1);
    return row ?? null;
  }

  async getProfileStats({
    agentId,
    days = 30,
    recentLimit = 8,
  }: AgentOperationProfileStatsParams): Promise<AgentOperationProfileStats> {
    const safeDays = Math.min(Math.max(Math.trunc(days) || 30, 1), 90);
    const safeRecentLimit = Math.min(Math.max(Math.trunc(recentLimit) || 8, 1), 20);
    const startDate = today()
      .subtract(safeDays - 1, 'day')
      .startOf('day')
      .toDate();

    const where = and(
      eq(agentOperations.userId, this.userId),
      eq(agentOperations.agentId, agentId),
      gte(agentOperations.createdAt, startDate),
    );

    const [summaryRow] = await this.db
      .select({
        averageDurationMs:
          sql<number>`COALESCE(AVG(${agentOperations.processingTimeMs}), 0)`.mapWith(Number),
        averageStepCount: sql<number>`COALESCE(AVG(${agentOperations.stepCount}), 0)`.mapWith(
          Number,
        ),
        completedOperations:
          sql<number>`COUNT(*) FILTER (WHERE ${agentOperations.status} = 'done')::int`.mapWith(
            Number,
          ),
        failedOperations:
          sql<number>`COUNT(*) FILTER (WHERE ${agentOperations.status} = 'error')::int`.mapWith(
            Number,
          ),
        interruptedOperations:
          sql<number>`COUNT(*) FILTER (WHERE ${agentOperations.status} = 'interrupted')::int`.mapWith(
            Number,
          ),
        llmCalls: sql<number>`COALESCE(SUM(${agentOperations.llmCalls}), 0)`.mapWith(Number),
        operationCount: sql<number>`COUNT(*)::int`.mapWith(Number),
        toolCalls: sql<number>`COALESCE(SUM(${agentOperations.toolCalls}), 0)`.mapWith(Number),
        totalCost: sql<number>`COALESCE(SUM(${agentOperations.totalCost}), 0)`.mapWith(Number),
        totalDurationMs: sql<number>`COALESCE(SUM(${agentOperations.processingTimeMs}), 0)`.mapWith(
          Number,
        ),
        totalInputTokens:
          sql<number>`COALESCE(SUM(${agentOperations.totalInputTokens}), 0)`.mapWith(Number),
        totalOutputTokens:
          sql<number>`COALESCE(SUM(${agentOperations.totalOutputTokens}), 0)`.mapWith(Number),
        totalTokens: sql<number>`COALESCE(SUM(${agentOperations.totalTokens}), 0)`.mapWith(Number),
      })
      .from(agentOperations)
      .where(where);

    const dayExpr = sql<string>`to_char(${agentOperations.createdAt}, 'YYYY-MM-DD')`;
    const dailyRows = await this.db
      .select({
        date: dayExpr,
        llmCalls: sql<number>`COALESCE(SUM(${agentOperations.llmCalls}), 0)`.mapWith(Number),
        operationCount: sql<number>`COUNT(*)::int`.mapWith(Number),
        processingTimeMs:
          sql<number>`COALESCE(SUM(${agentOperations.processingTimeMs}), 0)`.mapWith(Number),
        toolCalls: sql<number>`COALESCE(SUM(${agentOperations.toolCalls}), 0)`.mapWith(Number),
        totalCost: sql<number>`COALESCE(SUM(${agentOperations.totalCost}), 0)`.mapWith(Number),
        totalInputTokens:
          sql<number>`COALESCE(SUM(${agentOperations.totalInputTokens}), 0)`.mapWith(Number),
        totalOutputTokens:
          sql<number>`COALESCE(SUM(${agentOperations.totalOutputTokens}), 0)`.mapWith(Number),
        totalTokens: sql<number>`COALESCE(SUM(${agentOperations.totalTokens}), 0)`.mapWith(Number),
      })
      .from(agentOperations)
      .where(where)
      .groupBy(dayExpr)
      .orderBy(dayExpr);

    const recentRows = await this.db
      .select({
        completedAt: agentOperations.completedAt,
        completionReason: agentOperations.completionReason,
        createdAt: agentOperations.createdAt,
        error: agentOperations.error,
        id: agentOperations.id,
        llmCalls: agentOperations.llmCalls,
        model: agentOperations.model,
        processingTimeMs: agentOperations.processingTimeMs,
        provider: agentOperations.provider,
        startedAt: agentOperations.startedAt,
        status: agentOperations.status,
        stepCount: agentOperations.stepCount,
        toolCalls: agentOperations.toolCalls,
        totalCost: agentOperations.totalCost,
        totalInputTokens: agentOperations.totalInputTokens,
        totalOutputTokens: agentOperations.totalOutputTokens,
        totalTokens: agentOperations.totalTokens,
        trigger: agentOperations.trigger,
      })
      .from(agentOperations)
      .where(where)
      .orderBy(desc(agentOperations.createdAt))
      .limit(safeRecentLimit);

    const dailyByDate = new Map(dailyRows.map((row) => [row.date, row]));
    const daily = Array.from({ length: safeDays }, (_, index) => {
      const date = today()
        .subtract(safeDays - 1 - index, 'day')
        .format('YYYY-MM-DD');
      const row = dailyByDate.get(date);

      return {
        date,
        llmCalls: Number(row?.llmCalls ?? 0),
        operationCount: Number(row?.operationCount ?? 0),
        processingTimeMs: Number(row?.processingTimeMs ?? 0),
        toolCalls: Number(row?.toolCalls ?? 0),
        totalCost: Number(row?.totalCost ?? 0),
        totalInputTokens: Number(row?.totalInputTokens ?? 0),
        totalOutputTokens: Number(row?.totalOutputTokens ?? 0),
        totalTokens: Number(row?.totalTokens ?? 0),
      };
    });

    const operationCount = Number(summaryRow?.operationCount ?? 0);
    const completedOperations = Number(summaryRow?.completedOperations ?? 0);

    return {
      daily,
      recentOperations: recentRows.map((row) => ({
        completedAt: row.completedAt,
        completionReason: row.completionReason,
        createdAt: row.createdAt,
        errorMessage:
          typeof row.error?.message === 'string' && row.error.message.trim()
            ? row.error.message
            : undefined,
        id: row.id,
        llmCalls: Number(row.llmCalls ?? 0),
        model: row.model,
        processingTimeMs: Number(row.processingTimeMs ?? 0),
        provider: row.provider,
        startedAt: row.startedAt,
        status: row.status,
        stepCount: Number(row.stepCount ?? 0),
        toolCalls: Number(row.toolCalls ?? 0),
        totalCost: Number(row.totalCost ?? 0),
        totalInputTokens: Number(row.totalInputTokens ?? 0),
        totalOutputTokens: Number(row.totalOutputTokens ?? 0),
        totalTokens: Number(row.totalTokens ?? 0),
        trigger: row.trigger,
      })),
      summary: {
        averageDurationMs: Number(summaryRow?.averageDurationMs ?? 0),
        averageStepCount: Number(summaryRow?.averageStepCount ?? 0),
        completedOperations,
        failedOperations: Number(summaryRow?.failedOperations ?? 0),
        interruptedOperations: Number(summaryRow?.interruptedOperations ?? 0),
        llmCalls: Number(summaryRow?.llmCalls ?? 0),
        operationCount,
        successRate: operationCount > 0 ? completedOperations / operationCount : 0,
        toolCalls: Number(summaryRow?.toolCalls ?? 0),
        totalCost: Number(summaryRow?.totalCost ?? 0),
        totalDurationMs: Number(summaryRow?.totalDurationMs ?? 0),
        totalInputTokens: Number(summaryRow?.totalInputTokens ?? 0),
        totalOutputTokens: Number(summaryRow?.totalOutputTokens ?? 0),
        totalTokens: Number(summaryRow?.totalTokens ?? 0),
      },
    };
  }

  /**
   * Longest single operation (agent run) wall-clock execution time over the last
   * year, in seconds. Wall clock (`completedAt - startedAt`) is the most faithful
   * "task duration" — it spans the whole run including tool calls and waiting,
   * not just LLM compute. Returns 0 when there are no completed operations.
   */
  async getMaxDurationSeconds(): Promise<number> {
    const startDate = today().subtract(1, 'year').startOf('day').toDate();

    const [row] = await this.db
      .select({
        seconds:
          sql<number>`COALESCE(MAX(EXTRACT(EPOCH FROM (${agentOperations.completedAt} - ${agentOperations.startedAt}))), 0)`.mapWith(
            Number,
          ),
      })
      .from(agentOperations)
      .where(
        and(
          eq(agentOperations.userId, this.userId),
          isNotNull(agentOperations.startedAt),
          isNotNull(agentOperations.completedAt),
          gte(agentOperations.createdAt, startDate),
        ),
      );

    return row?.seconds ?? 0;
  }

  /**
   * Atomically flip a parked parent op from `waiting_for_async_tool` back to
   * `running`. Returns true only for the single winner (affected === 1) so
   * concurrent sub-op completions that lose the race no-op instead of
   * double-resuming the parent.
   */
  async tryResumeFromAsyncTool(operationId: string): Promise<boolean> {
    const rows = await this.db
      .update(agentOperations)
      .set({ status: 'running' })
      .where(
        and(
          eq(agentOperations.id, operationId),
          eq(agentOperations.userId, this.userId),
          eq(agentOperations.status, 'waiting_for_async_tool'),
        ),
      )
      .returning({ id: agentOperations.id });
    return rows.length === 1;
  }

  // ============================================
  // Verify (delivery checker) — plan snapshot lives on this row
  // ============================================

  /**
   * Write a draft check plan onto the operation and flip the rollup to `planned`.
   * The plan is mutable while a draft; it is frozen on `confirmVerifyPlan`.
   */
  async setVerifyPlan(operationId: string, items: VerifyCheckItem[]): Promise<void> {
    await this.db
      .update(agentOperations)
      .set({ verifyPlan: items, verifyStatus: 'planned' })
      .where(and(eq(agentOperations.id, operationId), eq(agentOperations.userId, this.userId)));
  }

  /** Replace the draft plan items (user edited the plan before confirming). */
  async replaceVerifyPlanItems(operationId: string, items: VerifyCheckItem[]): Promise<void> {
    await this.db
      .update(agentOperations)
      .set({ verifyPlan: items })
      .where(
        and(
          eq(agentOperations.id, operationId),
          eq(agentOperations.userId, this.userId),
          // only a not-yet-confirmed plan may be edited
          isNull(agentOperations.verifyPlanConfirmedAt),
        ),
      );
  }

  /** Freeze the plan (records confirmation time). Results relate to frozen items. */
  async confirmVerifyPlan(operationId: string, confirmedAt: Date = new Date()): Promise<void> {
    await this.db
      .update(agentOperations)
      .set({ verifyPlanConfirmedAt: confirmedAt })
      .where(and(eq(agentOperations.id, operationId), eq(agentOperations.userId, this.userId)));
  }

  /** Update the denormalized rollup. Always go through the service-layer chokepoint. */
  async updateVerifyStatus(operationId: string, verifyStatus: VerifyStatus | null): Promise<void> {
    await this.db
      .update(agentOperations)
      .set({ verifyStatus })
      .where(and(eq(agentOperations.id, operationId), eq(agentOperations.userId, this.userId)));
  }

  /** Read just the verify-related fields for an operation. */
  async getVerifyState(operationId: string) {
    const [row] = await this.db
      .select({
        verifyPlan: agentOperations.verifyPlan,
        verifyPlanConfirmedAt: agentOperations.verifyPlanConfirmedAt,
        verifyStatus: agentOperations.verifyStatus,
      })
      .from(agentOperations)
      .where(and(eq(agentOperations.id, operationId), eq(agentOperations.userId, this.userId)))
      .limit(1);
    return row ?? null;
  }
}
