import { describe, expect, it } from 'vitest';

import { resolveSystemAgentModelConfig } from './modelConfig';

describe('resolveSystemAgentModelConfig', () => {
  it('should keep a configured AgentAsia chat model', async () => {
    const result = await resolveSystemAgentModelConfig({
      taskConfig: {
        model: 'deepseek-v4-pro',
        provider: 'agentasia',
      },
      taskKey: 'topic',
    });

    expect(result).toEqual({ model: 'deepseek-v4-pro', provider: 'agentasia' });
  });

  it('should let runtime hooks resolve AgentAsia model mapping', async () => {
    const result = await resolveSystemAgentModelConfig({
      taskConfig: {
        model: 'mapped-topic-model',
        provider: 'agentasia',
      },
      taskKey: 'topic',
    });

    expect(result).toEqual({ model: 'mapped-topic-model', provider: 'agentasia' });
  });

  it('should keep deprecated AgentAsia model ids for runtime-level rejection', async () => {
    const result = await resolveSystemAgentModelConfig({
      taskConfig: {
        model: 'ag/gemini-3.1-pro-high',
        provider: 'agentasia',
      },
      taskKey: 'topic',
    });

    expect(result).toEqual({ model: 'ag/gemini-3.1-pro-high', provider: 'agentasia' });
  });

  it('should keep non-AgentAsia provider model ids untouched', async () => {
    const result = await resolveSystemAgentModelConfig({
      taskConfig: {
        model: 'private-model',
        provider: 'openai-compatible',
      },
      taskKey: 'topic',
    });

    expect(result).toEqual({ model: 'private-model', provider: 'openai-compatible' });
  });
});
