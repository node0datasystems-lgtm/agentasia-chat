'use client';

import type { BuiltinRenderProps } from '@agentasia/types';
import { Highlighter } from '@agentasia/ui';
import { memo } from 'react';

import type { WebSearchArgs } from '../../../types';

const WebSearch = memo<BuiltinRenderProps<WebSearchArgs>>(({ content }) => {
  if (!content) return null;

  return (
    <Highlighter
      wrap
      language={'text'}
      showLanguage={false}
      style={{ maxHeight: 240, overflow: 'auto' }}
      variant={'borderless'}
    >
      {content}
    </Highlighter>
  );
});

WebSearch.displayName = 'ClaudeCodeWebSearch';

export default WebSearch;
