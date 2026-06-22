import { agentasiaRouterRuntimeOptions } from '@lobehub/business-model-runtime';

import { createRouterRuntime } from '../../core/RouterRuntime';
import type { CreateRouterRuntimeOptions } from '../../core/RouterRuntime/createRuntime';

export const AgentAsiaAI = createRouterRuntime(
  agentasiaRouterRuntimeOptions as CreateRouterRuntimeOptions,
);
