'use client';

import type { AssistantContentBlock, EmojiReaction, UISignalCallbacksBlock } from '@lobechat/types';
import { ActionIcon, Flexbox } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { ChevronsDownUp } from 'lucide-react';
import type { MouseEventHandler, ReactNode } from 'react';
import { memo, Suspense, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MESSAGE_ACTION_BAR_PORTAL_ATTRIBUTES } from '@/const/messageActionPortal';
import { ChatItem } from '@/features/Conversation/ChatItem';
import { useOpenChatSettings } from '@/hooks/useInterceptingRoutes';
import dynamic from '@/libs/next/dynamic';
import { useAgentStore } from '@/store/agent';
import { builtinAgentSelectors } from '@/store/agent/selectors';
import { useGlobalStore } from '@/store/global';
import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors, userProfileSelectors } from '@/store/user/selectors';

import { ReactionDisplay } from '../../components/Reaction';
import { useAgentMeta } from '../../hooks';
import { dataSelectors, messageStateSelectors, useConversationStore } from '../../store';
import InterruptedHint from '../Assistant/components/InterruptedHint';
import Usage from '../components/Extras/Usage';
import MessageBranch from '../components/MessageBranch';
import {
  useSetMessageItemActionElementPortialContext,
  useSetMessageItemActionTypeContext,
} from '../Contexts/message-action-context';
import SignalCallbacks from '../SignalCallbacks';
import FileListViewer from '../User/components/FileListViewer';
import CollapsedTurn from './components/CollapsedTurn';
import Group from './components/Group';
import { resolveTurnCollapse } from './components/turnCollapse';
import type { WorkflowExpandLevelDefault } from './components/WorkflowCollapse';
import { formatReasoningDuration, getWorkflowSummaryText } from './toolDisplayNames';

const EditState = dynamic(() => import('./components/EditState'), {
  ssr: false,
});

const actionBarHolder = (
  <div
    {...{ [MESSAGE_ACTION_BAR_PORTAL_ATTRIBUTES.assistantGroup]: '' }}
    style={{ height: '28px' }}
  />
);
interface GroupMessageProps {
  defaultWorkflowExpandLevel?: WorkflowExpandLevelDefault;
  disableEditing?: boolean;
  footerRender?: ReactNode;
  id: string;
  index: number;
  isLatestItem?: boolean;
}

const GroupMessage = memo<GroupMessageProps>(
  ({ defaultWorkflowExpandLevel, id, index, disableEditing, footerRender, isLatestItem }) => {
    const { t } = useTranslation('chat');
    // Get message and actionsConfig from ConversationStore
    const item = useConversationStore(dataSelectors.getDisplayMessageById(id), isEqual)!;

    const {
      agentId,
      usage,
      createdAt,
      children,
      performance,
      model,
      provider,
      branch,
      metadata,
      signalCallbacks,
      taskCompletions,
    } = item;
    const avatar = useAgentMeta(agentId);

    // Collect fileList from all children blocks
    const aggregatedFileList = useMemo(() => {
      if (!children || children.length === 0) return [];
      return children.flatMap((child: AssistantContentBlock) => child.fileList || []);
    }, [children]);

    const isInbox = useAgentStore(builtinAgentSelectors.isInboxAgent);
    const [toggleSystemRole] = useGlobalStore((s) => [s.toggleSystemRole]);
    const openChatSettings = useOpenChatSettings();

    // Get the latest message block from the group that doesn't contain tools
    const lastAssistantMsg = useConversationStore(
      dataSelectors.getGroupLatestMessageWithoutTools(id),
    );

    const contentId = lastAssistantMsg?.id;

    // Get editing and interrupted state from ConversationStore
    const editing = useConversationStore(messageStateSelectors.isMessageEditing(contentId || ''));
    // Check interrupted on both the group root and the active block, because
    // continuation runs attach their operations to lastBlockId (contentId),
    // not the group root.
    const groupInterrupted = useConversationStore(messageStateSelectors.isMessageInterrupted(id));
    const blockInterrupted = useConversationStore(
      messageStateSelectors.isMessageInterrupted(contentId || ''),
    );
    const interrupted = groupInterrupted || blockInterrupted;

    const isDevMode = useUserStore((s) => userGeneralSettingsSelectors.config(s).isDevMode);
    const addReaction = useConversationStore((s) => s.addReaction);
    const removeReaction = useConversationStore((s) => s.removeReaction);
    const userId = useUserStore(userProfileSelectors.userId)!;
    const reactions: EmojiReaction[] = metadata?.reactions || [];

    const handleReactionClick = useCallback(
      (emoji: string) => {
        const existing = reactions.find((r) => r.emoji === emoji);
        if (existing && existing.users.includes(userId)) {
          removeReaction(id, emoji);
        } else {
          addReaction(id, emoji);
        }
      },
      [id, reactions, addReaction, removeReaction],
    );

    const isReactionActive = useCallback(
      (emoji: string) => {
        const reaction = reactions.find((r) => r.emoji === emoji);
        return !!reaction && reaction.users.includes(userId);
      },
      [reactions],
    );

    const setMessageItemActionElementPortialContext =
      useSetMessageItemActionElementPortialContext();
    const setMessageItemActionTypeContext = useSetMessageItemActionTypeContext();

    const onMouseEnter: MouseEventHandler<HTMLDivElement> = useCallback(
      (e) => {
        if (disableEditing) return;
        setMessageItemActionElementPortialContext(e.currentTarget);
        setMessageItemActionTypeContext({ id, index, type: 'assistantGroup' });
      },
      [
        disableEditing,
        id,
        index,
        setMessageItemActionElementPortialContext,
        setMessageItemActionTypeContext,
      ],
    );

    const onAvatarClick = useCallback(() => {
      if (!isInbox) {
        toggleSystemRole(true);
      } else {
        openChatSettings();
      }
    }, [isInbox]);

    // Codex-style history folding: a finished, non-latest turn collapses into a
    // compact summary so the conversation stays focused on the latest result.
    // This is a pure view affordance — ephemeral, never persisted (unlike the
    // separate `metadata.collapsed` message-collapse feature).
    const isGenerating = useConversationStore(
      messageStateSelectors.isAssistantGroupItemGenerating(id),
    );
    const [userExpanded, setUserExpanded] = useState<boolean | undefined>(undefined);
    const { collapsed, foldable } = resolveTurnCollapse({
      isGenerating,
      isLatestItem: !!isLatestItem,
      userExpanded,
    });

    const turnSummary = useMemo(() => {
      const fromContent = (lastAssistantMsg?.content ?? '')
        .trim()
        .split('\n')
        .map((line) =>
          line
            .replace(/^#{1,6}\s*/, '') // drop leading heading marks
            .replaceAll(/[*_`]+/g, '') // drop inline emphasis / code marks
            .trim(),
        )
        .find((line) => line.length > 0);
      if (fromContent) return fromContent.slice(0, 80);
      const fromWorkflow = children ? getWorkflowSummaryText(children) : '';
      return fromWorkflow || t('turnCollapse.done');
    }, [lastAssistantMsg?.content, children, t]);

    const durationText = useMemo(() => {
      const totalMs = (children ?? []).reduce(
        (sum, block) => sum + (block.performance?.duration ?? 0),
        0,
      );
      return totalMs > 0 ? formatReasoningDuration(totalMs) : undefined;
    }, [children]);

    if (collapsed) {
      return (
        <CollapsedTurn
          durationText={durationText}
          onExpand={() => setUserExpanded(true)}
          summary={turnSummary}
        />
      );
    }

    return (
      <ChatItem
        showTitle
        avatar={avatar}
        id={id}
        placement={'left'}
        time={createdAt}
        actions={
          !disableEditing && (
            <>
              {isDevMode && branch && (
                <MessageBranch
                  activeBranchIndex={branch.activeBranchIndex}
                  count={branch.count}
                  messageId={id}
                />
              )}
              {actionBarHolder}
            </>
          )
        }
        onAvatarClick={onAvatarClick}
        onMouseEnter={onMouseEnter}
      >
        {/*
          Wrap main chain + signal callbacks + post-task summary in a tight
          flex stack so the SignalCallbacks accordion sits visually inside
          the same "agent reply" block. The ChatItem body gap (16px) would
          otherwise stretch them apart and the natural narrative — initial
          reply → callbacks → summary — reads as three disconnected
          sections ().
        */}
        {foldable && (
          <Flexbox horizontal justify={'flex-end'}>
            <ActionIcon
              icon={ChevronsDownUp}
              size={'small'}
              title={t('turnCollapse.collapse')}
              onClick={() => setUserExpanded(false)}
            />
          </Flexbox>
        )}
        <Flexbox gap={4}>
          {children && children.length > 0 && (
            <Group
              blocks={children}
              content={lastAssistantMsg?.content}
              contentId={contentId}
              defaultWorkflowExpandLevel={defaultWorkflowExpandLevel}
              disableEditing={disableEditing}
              id={id}
              messageIndex={index}
            />
          )}
          {(signalCallbacks as UISignalCallbacksBlock[] | undefined)?.map((block) => (
            <SignalCallbacks block={block} key={block.sourceToolMessageId} />
          ))}
          {taskCompletions && taskCompletions.length > 0 && (
            <Group
              blocks={taskCompletions}
              contentId={taskCompletions.at(-1)?.id}
              defaultWorkflowExpandLevel={defaultWorkflowExpandLevel}
              disableEditing={disableEditing}
              id={id}
              messageIndex={index}
            />
          )}
        </Flexbox>

        {aggregatedFileList.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <FileListViewer items={aggregatedFileList} />
          </div>
        )}
        {interrupted && <InterruptedHint />}
        {isDevMode && model && (
          <Usage model={model} performance={performance} provider={provider!} usage={usage} />
        )}
        {footerRender}
        {reactions.length > 0 && (
          <ReactionDisplay
            isActive={isReactionActive}
            messageId={id}
            reactions={reactions}
            onReactionClick={handleReactionClick}
          />
        )}
        <Suspense fallback={null}>
          {editing && contentId && <EditState content={lastAssistantMsg?.content} id={contentId} />}
        </Suspense>
      </ChatItem>
    );
  },
  isEqual,
);

export default GroupMessage;
