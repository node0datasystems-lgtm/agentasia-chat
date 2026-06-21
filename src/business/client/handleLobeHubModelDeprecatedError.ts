import { ChatErrorType } from '@agentasia/types';
import { TRPCClientError } from '@trpc/client';
import { t } from 'i18next';

import { message } from '@/components/AntdStaticMethods';

interface AgentAsiaModelDeprecatedErrorData {
  modelType?: string;
  requestedModel?: string;
}

export const handleAgentAsiaModelDeprecatedError = (error: unknown) => {
  if (!(error instanceof TRPCClientError) || error.message !== ChatErrorType.AgentAsiaModelDeprecated)
    return;

  const requestedModel = (error.data?.errorData as AgentAsiaModelDeprecatedErrorData | undefined)
    ?.requestedModel;

  message.error(
    t('response.AgentAsiaModelDeprecated', {
      model: requestedModel ?? '-',
      ns: 'error',
    }),
  );
};
