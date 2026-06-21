import { agentasiaRouterRuntimeOptions } from '@agentasia/business-model-runtime';

import { createRouterRuntime } from '../../core/RouterRuntime';
import type { CreateRouterRuntimeOptions } from '../../core/RouterRuntime/createRuntime';

export const AgentAsiaAI = createRouterRuntime(
  agentasiaRouterRuntimeOptions as CreateRouterRuntimeOptions,
);
