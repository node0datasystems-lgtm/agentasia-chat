import { ORG_NAME } from '@agentasia/business-const';
import { type AgentAsiaProps } from '@lobehub/ui/brand';
import { AgentAsia } from '@lobehub/ui/brand';
import { memo } from 'react';

import { isCustomORG } from '@/const/version';

export const OrgBrand = memo<AgentAsiaProps>((props) => {
  if (isCustomORG) {
    return <span>{ORG_NAME}</span>;
  }

  return <AgentAsia {...props} />;
});
