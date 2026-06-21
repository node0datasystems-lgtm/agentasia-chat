'use client';

import { isDesktop } from '@agentasia/const';
import { memo } from 'react';

import { SubscriptionIframeWrapper } from './SubscriptionIframeWrapper';

const Credits = memo(() => {
  if (!isDesktop) return null;
  return <SubscriptionIframeWrapper page="credits" />;
});

Credits.displayName = 'Credits';
export default Credits;
