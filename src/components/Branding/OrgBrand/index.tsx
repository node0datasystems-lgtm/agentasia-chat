import { ORG_NAME } from '@agentasia/business-const';
import { type AgentAsiaProps } from '@agentasia/ui/brand';
import { AgentAsia } from '@agentasia/ui/brand';
import { memo } from 'react';

import { isCustomORG } from '@/const/version';

export const OrgBrand = memo<AgentAsiaProps>((props) => {
  if (isCustomORG) {
    return <span>{ORG_NAME}</span>;
  }

  return <AgentAsia {...props} />;
});
