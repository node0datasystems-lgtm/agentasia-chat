import { type SendMessageServerParams, type StructureOutputParams } from '@lobechat/types';
import { cleanObject } from '@lobechat/utils';

import { lambdaClient } from '@/libs/trpc/client';

import { omitOptimisticParentId } from './utils/optimisticMessage';

class AiChatService {
  sendMessageInServer = async (
    params: SendMessageServerParams,
    abortController: AbortController,
  ) => {
    const sanitizedParams: SendMessageServerParams = {
      ...params,
      newUserMessage: omitOptimisticParentId(params.newUserMessage),
    };

    return lambdaClient.aiChat.sendMessageInServer.mutate(cleanObject(sanitizedParams), {
      context: { showNotification: false },
      signal: abortController?.signal,
    });
  };

  generateJSON = async (params: StructureOutputParams, abortController: AbortController) => {
    return lambdaClient.aiChat.outputJSON.mutate(params, {
      context: { showNotification: false },
      signal: abortController?.signal,
    });
  };
}

export const aiChatService = new AiChatService();
