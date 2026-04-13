import { SpanStatusCode } from '@lobechat/observability-otel/api';
import {
  buildUpstashWorkflowAttributes,
  tracer as upstashWorkflowTracer,
} from '@lobechat/observability-otel/modules/upstash-workflow';
import { MemorySourceType } from '@lobechat/types';
import { type WorkflowContext } from '@upstash/workflow';

import { parseMemoryExtractionConfig } from '@/server/globalConfig/parseMemoryExtractionConfig';
import { type MemoryExtractionPayloadInput } from '@/server/services/memory/userMemory/extract';
import {
  buildWorkflowPayloadInput,
  MemoryExtractionExecutor,
  MemoryExtractionWorkflowService,
  normalizeMemoryExtractionPayload,
} from '@/server/services/memory/userMemory/extract';

const { upstashWorkflowExtraHeaders } = parseMemoryExtractionConfig();

/**
 * L1: Entry for the topics extraction pipeline.
 *
 * - If `userIds` in payload, skip the eligibility query and fan out directly via L2.
 * - Else materialise the full eligible user list in one step so dry-run can report the exact total.
 * - When not dry-run: trigger L2 (paginate-users) to walk all users via cursor pagination.
 */
export const processUsersHandler = (context: WorkflowContext<MemoryExtractionPayloadInput>) =>
  upstashWorkflowTracer.startActiveSpan(
    'workflow:memory-user-memory:topics:process-users',
    async (span) => {
      const payload = normalizeMemoryExtractionPayload(context.requestPayload || {});
      const dryRun = !!(context.requestPayload as { dryRun?: boolean } | null)?.dryRun;

      span.setAttributes({
        ...buildUpstashWorkflowAttributes(context),
        'workflow.memory_user_memory.dry_run': dryRun,
        'workflow.memory_user_memory.payload_user_count': payload.userIds.length,
        'workflow.name': 'memory-user-memory:topics:process-users',
      });

      // Ensure source defaults to ChatTopic when caller omitted it — topics pipeline is chat-topic-only.
      const sources = payload.sources.length ? payload.sources : [MemorySourceType.ChatTopic];
      if (!sources.includes(MemorySourceType.ChatTopic)) {
        span.setStatus({ code: SpanStatusCode.OK });
        return {
          message: 'No supported sources requested, skip topics process-users.',
          success: true,
        };
      }

      // Explicit target userIds path: skip the eligibility query and go straight to fan-out via L2.
      if (payload.userIds.length > 0) {
        if (dryRun) {
          span.setStatus({ code: SpanStatusCode.OK });
          return {
            dryRun: true,
            message: `[DryRun] Would fan out ${payload.userIds.length} pre-specified users.`,
            success: true,
            targetUsers: payload.userIds.length,
          };
        }

        await context.run('memory:topics:process-users:trigger-paginate-fanout', () =>
          MemoryExtractionWorkflowService.triggerTopicsPaginateUsers(
            buildWorkflowPayloadInput({ ...payload, sources, userCursor: undefined }),
            { extraHeaders: upstashWorkflowExtraHeaders },
          ),
        );

        span.setStatus({ code: SpanStatusCode.OK });
        return { success: true, triggeredFanout: payload.userIds.length };
      }

      // Count-only query: cheap COUNT(*) with the hourly-extraction filter (memory-enabled + has
      // at least one user message). Gives an exact total for dry-run.
      const executor = await MemoryExtractionExecutor.create();
      const totalEligible = await context.run(
        'memory:topics:process-users:count-eligible-users',
        () => executor.countUsersForHourlyExtraction(),
      );

      if (totalEligible === 0) {
        span.setStatus({ code: SpanStatusCode.OK });
        return {
          message: 'No eligible users for topics extraction.',
          success: true,
          totalEligible: 0,
        };
      }

      if (dryRun) {
        span.setStatus({ code: SpanStatusCode.OK });
        return {
          dryRun: true,
          message: `[DryRun] Would process ${totalEligible} users.`,
          success: true,
          totalEligible,
        };
      }

      // Trigger L2 to walk all users via cursor pagination.
      await context.run('memory:topics:process-users:trigger-paginate', () =>
        MemoryExtractionWorkflowService.triggerTopicsPaginateUsers(
          buildWorkflowPayloadInput({
            ...payload,
            sources,
            userCursor: undefined,
            userIds: [],
          }),
          { extraHeaders: upstashWorkflowExtraHeaders },
        ),
      );

      span.setStatus({ code: SpanStatusCode.OK });
      return {
        message: `Triggered paginate-users for ${totalEligible} eligible users.`,
        success: true,
        totalEligible,
      };
    },
  );
