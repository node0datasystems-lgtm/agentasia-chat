import { type WorkflowContext } from '@upstash/workflow';

import { parseMemoryExtractionConfig } from '@/server/globalConfig/parseMemoryExtractionConfig';
import {
  MemoryExtractionExecutor,
  MemoryExtractionWorkflowService,
  type PersonaProcessUsersWorkflowPayload,
} from '@/server/services/memory/userMemory/extract';

const { upstashWorkflowExtraHeaders } = parseMemoryExtractionConfig();

const requireBaseUrl = (baseUrl?: string) => {
  if (!baseUrl) throw new Error('Missing baseUrl for persona process-users');
  return baseUrl;
};

/**
 * L1: Entry for the persona update pipeline.
 *
 * - If `userIds` provided, skip eligibility query and fan out directly via L2.
 * - Else materialise the full eligible user list in one step so dry-run can report the exact total.
 * - When not dry-run: trigger L2 (paginate-users) to walk all users via cursor pagination.
 */
export const processUsersHandler = async (
  context: WorkflowContext<PersonaProcessUsersWorkflowPayload>,
) => {
  const payload = context.requestPayload || ({} as PersonaProcessUsersWorkflowPayload);
  const baseUrl = requireBaseUrl(payload.baseUrl);
  const dryRun = !!payload.dryRun;

  if (payload.userIds && payload.userIds.length > 0) {
    if (dryRun) {
      return {
        dryRun: true,
        message: `[DryRun] Would fan out ${payload.userIds.length} pre-specified users.`,
        success: true,
        targetUsers: payload.userIds.length,
      };
    }

    await context.run('memory:persona:process-users:trigger-paginate-fanout', () =>
      MemoryExtractionWorkflowService.triggerPersonaPaginateUsers(
        { baseUrl, userIds: payload.userIds },
        { extraHeaders: upstashWorkflowExtraHeaders },
      ),
    );

    return { success: true, triggeredFanout: payload.userIds.length };
  }

  // Count-only query: cheap COUNT(*) with the hourly-extraction filter.
  const executor = await MemoryExtractionExecutor.create();
  const totalEligible = await context.run('memory:persona:process-users:count-eligible-users', () =>
    executor.countUsersForHourlyExtraction(),
  );

  if (totalEligible === 0) {
    return {
      message: 'No eligible users for persona update.',
      success: true,
      totalEligible: 0,
    };
  }

  if (dryRun) {
    return {
      dryRun: true,
      message: `[DryRun] Would process ${totalEligible} users.`,
      success: true,
      totalEligible,
    };
  }

  await context.run('memory:persona:process-users:trigger-paginate', () =>
    MemoryExtractionWorkflowService.triggerPersonaPaginateUsers(
      { baseUrl },
      { extraHeaders: upstashWorkflowExtraHeaders },
    ),
  );

  return {
    message: `Triggered paginate-users for ${totalEligible} eligible users.`,
    success: true,
    totalEligible,
  };
};
