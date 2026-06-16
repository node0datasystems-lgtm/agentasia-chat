'use client';

import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import { ChatList } from '@/features/Conversation';
import { dataSelectors, useConversationStore } from '@/features/Conversation/store';

import MiniChatInput from './MiniChatInput';

const ChatBody = memo(() => {
  const hasMessages = useConversationStore((s) => dataSelectors.displayMessageIds(s).length > 0);

  return (
    <Flexbox
      data-testid="floating-chat-panel-body"
      flex={1}
      height={'100%'}
      style={{ minHeight: 0, overflow: 'hidden' }}
      width={'100%'}
    >
      {hasMessages && (
        <Flexbox
          data-testid="floating-chat-panel-list"
          flex={1}
          width={'100%'}
          style={{
            minHeight: 0,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <ChatList />
        </Flexbox>
      )}
      <MiniChatInput />
    </Flexbox>
  );
});

ChatBody.displayName = 'FloatingChatPanelBody';

export default ChatBody;
