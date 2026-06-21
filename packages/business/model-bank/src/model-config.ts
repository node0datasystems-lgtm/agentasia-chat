import type { AiFullModelCard, AiModelType } from 'model-bank';
import { loadModels as loadModelBankModels, ModelProvider } from 'model-bank';

interface AgentAsiaModelConfig {
  models: AiFullModelCard[];
  planCardModels: string[];
  updatedAt?: string;
  version: number;
}

const getDefaultAgentAsiaModelConfig = (): AgentAsiaModelConfig => ({
  models: [],
  planCardModels: [],
  version: 1,
});

const loadAgentAsiaModelConfig = async (): Promise<AgentAsiaModelConfig> =>
  getDefaultAgentAsiaModelConfig();

export const loadModels = async () =>
  loadModelBankModels({
    providerLoaders: {
      [ModelProvider.AgentAsia]: loadAgentAsiaModels,
    },
  });

const loadAgentAsiaModels = async (): Promise<AiFullModelCard[]> =>
  (await loadAgentAsiaModelConfig()).models;

export const loadAgentAsiaPlanCardModels = async (): Promise<string[]> =>
  (await loadAgentAsiaModelConfig()).planCardModels;

export const isAgentAsiaModelAvailable = (
  _id: string,
  _expectedType: AiModelType,
  _options?: {
    getUserEmail?: () => Promise<string | null | undefined>;
    userEmail?: string | null;
  },
): boolean => false;
