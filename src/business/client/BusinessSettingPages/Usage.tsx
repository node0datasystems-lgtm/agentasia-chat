'use client';

import { isDesktop } from '@agentasia/const';
import { memo } from 'react';

import { SubscriptionIframeWrapper } from './SubscriptionIframeWrapper';

const Usage = memo(() => {
  if (!isDesktop) return null;
  return <SubscriptionIframeWrapper page="usage" />;
});

Usage.displayName = 'Usage';
export default Usage;
