import { Flexbox, Icon, Text } from '@lobehub/ui';
import { createStaticStyles, cssVar } from 'antd-style';
import { ChevronRight } from 'lucide-react';
import { memo } from 'react';

const styles = createStaticStyles(({ css }) => ({
  duration: css`
    flex: none;
    font-size: 12px;
    color: ${cssVar.colorTextQuaternary};
  `,
  row: css`
    cursor: pointer;
    padding-block: 6px;
    padding-inline: 8px;
    border-radius: 8px;
    color: ${cssVar.colorTextTertiary};

    &:hover {
      background: ${cssVar.colorFillTertiary};
      color: ${cssVar.colorTextSecondary};
    }
  `,
  summary: css`
    overflow: hidden;
    flex: 1;
    color: inherit;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
}));

interface CollapsedTurnProps {
  /** Formatted turn duration, e.g. "3m 37s". Hidden when absent. */
  durationText?: string;
  onExpand: () => void;
  /** One-line summary of the finished turn (final answer headline). */
  summary: string;
}

/**
 * Compact, Codex-style placeholder for a finished, non-latest agent turn.
 * Renders a single muted clickable row so the conversation stays focused on
 * the latest result; clicking restores the full turn. Purely a view affordance
 * — it never persists collapse state.
 */
const CollapsedTurn = memo<CollapsedTurnProps>(({ summary, durationText, onExpand }) => (
  <Flexbox
    horizontal
    align={'center'}
    className={styles.row}
    gap={6}
    role={'button'}
    onClick={onExpand}
  >
    <Icon icon={ChevronRight} size={'small'} />
    <Text className={styles.summary}>{summary}</Text>
    {durationText && <span className={styles.duration}>{durationText}</span>}
  </Flexbox>
));

CollapsedTurn.displayName = 'CollapsedTurn';

export default CollapsedTurn;
