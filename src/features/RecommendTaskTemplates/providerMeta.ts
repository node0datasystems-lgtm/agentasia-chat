import type {
  LobehubSkillProviderType,
  TaskTemplateConnectorReference,
  TaskTemplateConnectorSource,
} from '@agentasia/const';
import { getComposioAppByIdentifier, getLobehubSkillProviderById } from '@agentasia/const';

export interface ConnectorProviderMeta {
  icon: LobehubSkillProviderType['icon'];
  identifier: string;
  label: string;
  source: TaskTemplateConnectorSource;
}

export const getProviderMeta = (
  spec: TaskTemplateConnectorReference,
): ConnectorProviderMeta | undefined => {
  if (spec.source === 'agentasia') {
    const p = getLobehubSkillProviderById(spec.identifier);
    if (!p) return undefined;
    return { icon: p.icon, identifier: spec.identifier, label: p.label, source: 'agentasia' };
  }
  const p = getComposioAppByIdentifier(spec.identifier);
  if (!p) return undefined;
  return { icon: p.icon, identifier: spec.identifier, label: p.label, source: 'composio' };
};

export const findNextUnconnectedSpec = (
  specs: TaskTemplateConnectorReference[] | undefined,
  isConnected: (spec: TaskTemplateConnectorReference) => boolean,
): ConnectorProviderMeta | undefined => {
  if (!specs || specs.length === 0) return undefined;
  for (const spec of specs) {
    if (isConnected(spec)) continue;
    const meta = getProviderMeta(spec);
    if (!meta) continue;
    return meta;
  }
  return undefined;
};
