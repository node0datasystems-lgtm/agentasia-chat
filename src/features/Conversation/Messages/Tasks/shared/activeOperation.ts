import type { ChatOperationState } from '@/store/chat/slices/operation/initialState';
import { AI_RUNTIME_OPERATION_TYPES } from '@/store/chat/slices/operation/types';

export const hasActiveRuntimeOperationForMessage = (
  operations: ChatOperationState['operations'],
  messageId: string,
): boolean =>
  Object.values(operations).some(
    (op) =>
      op.status === 'running' &&
      AI_RUNTIME_OPERATION_TYPES.includes(op.type) &&
      op.context?.messageId === messageId,
  );
