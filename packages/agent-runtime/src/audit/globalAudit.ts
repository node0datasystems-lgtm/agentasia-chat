import { type GlobalInterventionAuditConfig } from '@agentasia/types';

import { createSecurityBlacklistGlobalAudit } from './createSecurityBlacklistAudit';

export const createDefaultGlobalAudits = (): GlobalInterventionAuditConfig[] => [
  createSecurityBlacklistGlobalAudit(),
  createSecurityBlacklistGlobalAudit('required'),
];
