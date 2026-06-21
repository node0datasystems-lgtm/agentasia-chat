import { pathScopeAudit } from '@agentasia/builtin-tool-local-system';
import { type DynamicInterventionResolver } from '@agentasia/types';

export const dynamicInterventionAudits: Record<string, DynamicInterventionResolver> = {
  pathScopeAudit,
};
