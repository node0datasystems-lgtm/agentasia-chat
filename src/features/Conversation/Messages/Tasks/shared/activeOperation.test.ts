import { describe, expect, it } from 'vitest';

import type { ChatOperationState } from '@/store/chat/slices/operation/initialState';

import { hasActiveRuntimeOperationForMessage } from './activeOperation';

type OperationRecord = ChatOperationState['operations'];

const createOperation = (
  type: OperationRecord[string]['type'],
  status: OperationRecord[string]['status'],
  messageId = 'msg-1',
): OperationRecord[string] => ({
  abortController: new AbortController(),
  context: { messageId },
  id: `${type}-${status}`,
  metadata: { startTime: 1 },
  status,
  type,
});

describe('hasActiveRuntimeOperationForMessage', () => {
  it('treats running server runtime operations as active', () => {
    const operations: OperationRecord = {
      'op-server': createOperation('execServerAgentRuntime', 'running'),
    };

    expect(hasActiveRuntimeOperationForMessage(operations, 'msg-1')).toBe(true);
  });

  it('ignores completed runtime operations and unrelated messages', () => {
    const operations: OperationRecord = {
      'op-completed': createOperation('execAgentRuntime', 'completed'),
      'op-other-message': createOperation('execHeterogeneousAgent', 'running', 'msg-2'),
      'op-tool': createOperation('toolCalling', 'running'),
    };

    expect(hasActiveRuntimeOperationForMessage(operations, 'msg-1')).toBe(false);
  });
});
