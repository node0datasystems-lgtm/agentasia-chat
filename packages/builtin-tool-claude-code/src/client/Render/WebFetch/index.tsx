'use client';

import type { BuiltinRenderProps } from '@agentasia/types';
import { Markdown } from '@agentasia/ui';
import { memo } from 'react';

import type { WebFetchArgs } from '../../../types';

const WebFetch = memo<BuiltinRenderProps<WebFetchArgs>>(({ content }) => {
  if (!content) return null;

  return (
    <Markdown style={{ maxHeight: 240, overflow: 'auto' }} variant={'chat'}>
      {content}
    </Markdown>
  );
});

WebFetch.displayName = 'ClaudeCodeWebFetch';

export default WebFetch;
