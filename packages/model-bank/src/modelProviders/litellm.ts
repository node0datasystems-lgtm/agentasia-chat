import type { ModelProviderCard } from '@/types/llm';

/**
 * LiteLLM Provider Card
 *
 * Connects AgentAsia to LiteLLM proxy routers:
 * - Freemium tier:  http://localhost:5001
 * - Paid tier:      http://localhost:4000
 *
 * Environment Variables:
 *   LITELLM_FREEMIUM_URL  - Override freemium proxy URL
 *   LITELLM_PAID_URL      - Override paid router URL
 *   LITELLM_API_KEY       - API key (optional)
 */
const LiteLLM: ModelProviderCard = {
  chatModels: [],
  description:
    'LiteLLM proxy — connects to local LiteLLM routers for unified model access. Freemium at localhost:5001, paid at localhost:4000.',
  id: 'litellm',
  modelsUrl: 'https://docs.litellm.ai',
  name: 'LiteLLM',
  settings: {
    defaultShowBrowserRequest: true,
    proxyUrl: {
      placeholder: 'http://localhost:5001',
    },
    responseAnimation: {
      speed: 2,
      text: 'smooth',
    },
    showModelFetcher: true,
  },
  url: 'https://docs.litellm.ai',
};

export default LiteLLM;
