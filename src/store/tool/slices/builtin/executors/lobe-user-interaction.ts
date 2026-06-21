import { UserInteractionExecutionRuntime } from '@agentasia/builtin-tool-user-interaction/executionRuntime';
import { UserInteractionExecutor } from '@agentasia/builtin-tool-user-interaction/executor';

const runtime = new UserInteractionExecutionRuntime();

export const userInteractionExecutor = new UserInteractionExecutor(runtime);
