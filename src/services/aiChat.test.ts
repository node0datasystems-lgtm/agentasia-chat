import { describe, expect, it, vi } from 'vitest';

import { lambdaClient } from '@/libs/trpc/client';

import { aiChatService } from './aiChat';

vi.mock('@/libs/trpc/client', () => ({
  lambdaClient: {
    aiChat: {
      sendMessageInServer: { mutate: vi.fn() },
    },
  },
}));

describe('AiChatService', () => {
  describe('sendMessageInServer', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should omit optimistic temporary parent ids before calling lambdaClient', async () => {
      vi.mocked(lambdaClient.aiChat.sendMessageInServer.mutate).mockResolvedValue({} as any);

      const abortController = new AbortController();

      await aiChatService.sendMessageInServer(
        {
          newAssistantMessage: { provider: 'openai' },
          newUserMessage: {
            content: 'test',
            parentId: 'tmp_staleParent',
          },
        },
        abortController,
      );

      expect(lambdaClient.aiChat.sendMessageInServer.mutate).toHaveBeenCalledWith(
        {
          newAssistantMessage: { provider: 'openai' },
          newUserMessage: {
            content: 'test',
            parentId: undefined,
          },
        },
        {
          context: { showNotification: false },
          signal: abortController.signal,
        },
      );
    });

    it('should preserve persisted parent ids', async () => {
      vi.mocked(lambdaClient.aiChat.sendMessageInServer.mutate).mockResolvedValue({} as any);

      const abortController = new AbortController();

      await aiChatService.sendMessageInServer(
        {
          newAssistantMessage: { provider: 'openai' },
          newUserMessage: {
            content: 'test',
            parentId: 'msg_parent',
          },
        },
        abortController,
      );

      expect(lambdaClient.aiChat.sendMessageInServer.mutate).toHaveBeenCalledWith(
        {
          newAssistantMessage: { provider: 'openai' },
          newUserMessage: {
            content: 'test',
            parentId: 'msg_parent',
          },
        },
        {
          context: { showNotification: false },
          signal: abortController.signal,
        },
      );
    });
  });
});
