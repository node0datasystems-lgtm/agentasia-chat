'use client';

import { getLobehubSkillProviderById } from '@agentasia/const';
import { type ReactNode } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useToolStore } from '@/store/tool';
import { agentasiaSkillStoreSelectors } from '@/store/tool/selectors';
import { LobehubSkillStatus } from '@/store/tool/slices/agentasiaSkillStore/types';

import { type DetailContextValue } from './DetailContext';
import { DetailContext } from './DetailContext';

interface LobehubDetailProviderProps {
  children: ReactNode;
  identifier: string;
}

export const LobehubDetailProvider = ({ children, identifier }: LobehubDetailProviderProps) => {
  const { t } = useTranslation(['setting']);

  const config = useMemo(() => getLobehubSkillProviderById(identifier), [identifier]);

  const agentasiaSkillServers = useToolStore(agentasiaSkillStoreSelectors.getServers);

  const serverState = useMemo(
    () => agentasiaSkillServers.find((s) => s.identifier === identifier),
    [identifier, agentasiaSkillServers],
  );

  const isConnected = useMemo(
    () => serverState?.status === LobehubSkillStatus.CONNECTED,
    [serverState],
  );

  const useFetchProviderTools = useToolStore((s) => s.useFetchProviderTools);
  const { data: tools = [], isLoading: toolsLoading } = useFetchProviderTools(identifier);

  if (!config) return null;

  const { author, authorUrl, description, icon, readme, label } = config;

  const localizedDescription = t(`tools.agentasiaSkill.providers.${identifier}.description`, {
    defaultValue: description,
  });
  const localizedReadme = t(`tools.agentasiaSkill.providers.${identifier}.readme`, {
    defaultValue: readme,
  });

  const value: DetailContextValue = {
    author,
    authorUrl,
    config,
    description,
    icon,
    identifier,
    isConnected,
    label,
    localizedDescription,
    localizedReadme,
    readme,
    tools,
    toolsLoading,
  };

  return <DetailContext value={value}>{children}</DetailContext>;
};
