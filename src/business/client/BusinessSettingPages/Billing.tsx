'use client';

import { isDesktop } from '@agentasia/const';
import { memo } from 'react';

import { SubscriptionIframeWrapper } from './SubscriptionIframeWrapper';

const Billing = memo(() => {
  if (!isDesktop) return null;
  return <SubscriptionIframeWrapper page="billing" />;
});

Billing.displayName = 'Billing';
export default Billing;
