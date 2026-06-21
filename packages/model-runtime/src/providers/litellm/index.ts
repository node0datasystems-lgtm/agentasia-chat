import type { ChatModelCard } from '@agentasia/types';
import { ModelProvider } from 'model-bank';

import type { OpenAICompatibleFactoryOptions } from '../../core/openaiCompatibleFactory';
import { createOpenAICompatibleRuntime } from '../../core/openaiCompatibleFactory';

export interface LiteLLMModelCard {
  id: string;
}

/**
 * LiteLLM Provider - connects to local LiteLLM proxy routers.
 *
 * Tier 1 (Free):  localhost:5001  (freemium proxy)
 * Tier 2 (Paid):  localhost:4000  (full LiteLLM router with all models)
 *
 * Environment Variables:
 *   LITELLM_FREEMIUM_URL  - Override freemium proxy URL (default: http://localhost:5001)
 *   LITELLM_PAID_URL      - Override paid router URL (default: http://localhost:4000)
 *   LITELLM_API_KEY       - API key for LiteLLM (optional, set per-deployment)
 */
const freemiumUrl =
  process.env.LITELLM_FREEMIUM_URL || 'http://localhost:5001';
const paidUrl = process.env.LITELLM_PAID_URL || 'http://localhost:4000';

export const params = {
  apiKey: 'placeholder-to-avoid-error',
  baseURL: freemiumUrl,
  debug: {
    chatCompletion: () => process.env.DEBUG_LITELLM_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const { LOBE_DEFAULT_MODEL_LIST } = await import('model-bank');

    const modelsPage = (await client.models.list()) as any;
    const modelList: LiteLLMModelCard[] = modelsPage.data || [];

    return modelList
      .map((model) => {
        const knownModel = LOBE_DEFAULT_MODEL_LIST.find(
          (m) => model.id.toLowerCase() === m.id.toLowerCase(),
        );

        return {
          contextWindowTokens: knownModel?.contextWindowTokens ?? undefined,
          displayName: knownModel?.displayName ?? undefined,
          enabled: knownModel?.enabled || false,
          functionCall: knownModel?.abilities?.functionCall || false,
          id: model.id,
          reasoning: knownModel?.abilities?.reasoning || false,
          vision: knownModel?.abilities?.vision || false,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.LiteLLM,
  routers: [
    // Freemium tier — primary
    {
      apiType: 'openai' as const,
      id: 'freemium',
      models: [], // Fetch from API
      options: { baseURL: freemiumUrl },
      remark: 'Freemium tier (localhost:5001)',
    },
    // Paid tier — fallback with all models
    {
      apiType: 'openai' as const,
      id: 'paid',
      models: [], // Fetch from API
      options: { baseURL: paidUrl },
      remark: 'Paid tier (localhost:4000)',
    },
  ],
} satisfies OpenAICompatibleFactoryOptions;

export const LobeLiteLLMAI = createOpenAICompatibleRuntime(params);
