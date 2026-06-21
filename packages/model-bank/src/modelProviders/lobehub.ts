import type { ModelProviderCard } from '@/types/llm';

const AgentAsia: ModelProviderCard = {
  chatModels: [],
  description:
    'AgentAsia Cloud uses official APIs to access AI models and measures usage with Credits tied to model tokens.',
  enabled: true,
  id: 'agentasia',
  modelsUrl: 'https://agentasia.ai/zh/docs/usage/subscription/model-pricing',
  name: 'AgentAsia',
  settings: {
    modelEditable: false,
    showAddNewModel: false,
    showModelFetcher: false,
  },
  showConfig: false,
  url: 'https://agentasia.ai',
};

export default AgentAsia;

export const planCardModels = [
  'deepseek-v4-pro',
  'claude-sonnet-4-6',
  'gemini-3.1-pro-preview',
  'gpt-5.5',
];
