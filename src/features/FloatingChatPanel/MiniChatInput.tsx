'use client';

import { ChatInput as EditorChatInput, ChatInputActionBar } from '@lobehub/editor/react';
import { Flexbox } from '@lobehub/ui';
import { createStaticStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import type { ActionKeys, ChatInputFeature } from '@/features/ChatInput';
import { actionMap } from '@/features/ChatInput/ActionBar/config';
import type { ActionBarContextValue } from '@/features/ChatInput/ActionBar/context';
import { ActionBarContext } from '@/features/ChatInput/ActionBar/context';
import InputEditor from '@/features/ChatInput/InputEditor';
import SendButton from '@/features/ChatInput/SendArea/SendButton';
import { useChatInputStore } from '@/features/ChatInput/store';
import TypoBar from '@/features/ChatInput/TypoBar';
import { ChatInput } from '@/features/Conversation';

const Typo = actionMap.typo;
const STT = actionMap.stt;

const MINI_LEFT_ACTIONS: ActionKeys[] = ['typo', 'stt'];
const EMPTY_RIGHT_ACTIONS: ActionKeys[] = [];
const MINI_CHAT_INPUT_FEATURE = {
  inputCompletion: true,
  mention: false,
  slash: true,
} satisfies ChatInputFeature;
const MINI_SEND_BUTTON_PROPS = { size: 28 };

const MINI_ACTION_CONTEXT = {
  actionSize: { blockSize: 26, size: 15 },
  borderRadius: 8,
  dropdownPlacement: 'top',
} satisfies ActionBarContextValue;

const styles = createStaticStyles(({ css, cssVar }) => ({
  container: css`
    flex-shrink: 0;

    width: 100%;
    padding-block: 8px 10px;
    padding-inline: 12px;
    border-block-start: 1px solid ${cssVar.colorBorderSecondary};

    background: ${cssVar.colorBgContainer};
  `,
  input: css`
    border-color: ${cssVar.colorBorderSecondary};
    border-radius: 10px !important;

    background: ${cssVar.colorFillTertiary};
    box-shadow: none;

    transition:
      border-color 0.2s ease,
      background 0.2s ease;

    &:focus-within {
      border-color: ${cssVar.colorPrimary};
      background: ${cssVar.colorBgContainer};
    }
  `,
}));

const MiniChatInputInner = memo(() => {
  const { t } = useTranslation('chat');
  const [showTypoBar, slashMenuRef] = useChatInputStore((s) => [s.showTypoBar, s.slashMenuRef]);

  return (
    <Flexbox className={styles.container} data-testid="floating-chat-panel-input">
      <EditorChatInput
        className={styles.input}
        defaultHeight={34}
        header={showTypoBar && <TypoBar />}
        maxHeight={136}
        minHeight={34}
        resize={false}
        slashMenuRef={slashMenuRef}
        footer={
          <ChatInputActionBar
            right={<SendButton />}
            style={{ padding: '0 6px 6px' }}
            left={
              <ActionBarContext value={MINI_ACTION_CONTEXT}>
                <Flexbox horizontal align={'center'} gap={2}>
                  <Typo />
                  <STT />
                </Flexbox>
              </ActionBarContext>
            }
          />
        }
      >
        <InputEditor defaultRows={1} placeholder={t('pageCopilot.inlinePlaceholder')} />
      </EditorChatInput>
    </Flexbox>
  );
});

MiniChatInputInner.displayName = 'FloatingChatPanelMiniChatInputInner';

const MiniChatInput = memo(() => {
  return (
    <ChatInput
      allowExpand={false}
      feature={MINI_CHAT_INPUT_FEATURE}
      leftActions={MINI_LEFT_ACTIONS}
      rightActions={EMPTY_RIGHT_ACTIONS}
      sendButtonProps={MINI_SEND_BUTTON_PROPS}
      showControlBar={false}
    >
      <MiniChatInputInner />
    </ChatInput>
  );
});

MiniChatInput.displayName = 'FloatingChatPanelMiniChatInput';

export default MiniChatInput;
