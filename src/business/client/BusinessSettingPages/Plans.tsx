'use client';

import { isDesktop } from '@agentasia/const';
import { memo } from 'react';

import { SubscriptionIframeWrapper } from './SubscriptionIframeWrapper';

const Plans = memo(() => {
  if (!isDesktop) return null;
  return <SubscriptionIframeWrapper page="plans" />;
});

Plans.displayName = 'Plans';
export default Plans;
