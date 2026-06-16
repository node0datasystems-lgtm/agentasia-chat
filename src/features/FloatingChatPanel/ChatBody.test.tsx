/**
 * @vitest-environment happy-dom
 */
import { render, screen } from '@testing-library/react';
import type { CSSProperties, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ChatBody from './ChatBody';

vi.mock('@lobehub/ui', () => ({
  Flexbox: ({
    children,
    flex,
    height,
    style,
    width,
    ...props
  }: {
    children?: ReactNode;
    flex?: number;
    height?: string;
    style?: CSSProperties;
    width?: string;
    [key: string]: unknown;
  }) => (
    <div
      data-flex={flex === undefined ? '' : String(flex)}
      data-height={height ?? ''}
      data-width={width ?? ''}
      style={style}
      {...props}
    >
      {children}
    </div>
  ),
}));

vi.mock('@/features/Conversation', () => ({
  ChatList: () => <div data-testid="floating-chat-list">chat list</div>,
}));

const mockConversationState = vi.hoisted(() => ({
  displayMessageIds: [] as string[],
}));

vi.mock('@/features/Conversation/store', () => ({
  dataSelectors: {
    displayMessageIds: (s: { displayMessageIds: string[] }) => s.displayMessageIds,
  },
  useConversationStore: (selector: (state: { displayMessageIds: string[] }) => unknown) =>
    selector(mockConversationState),
}));

vi.mock('./MiniChatInput', () => ({
  default: () => <div data-testid="floating-chat-input">mini input</div>,
}));

describe('FloatingChatPanel ChatBody', () => {
  beforeEach(() => {
    mockConversationState.displayMessageIds = [];
  });

  it('renders only the mini input before the conversation starts', () => {
    render(<ChatBody />);

    const body = screen.getByTestId('floating-chat-panel-body');
    const input = screen.getByTestId('floating-chat-input');

    expect(body).toHaveAttribute('data-flex', '1');
    expect(body).toHaveAttribute('data-height', '100%');
    expect(body).toContainElement(input);
    expect(screen.queryByTestId('floating-chat-panel-list')).not.toBeInTheDocument();
    expect(body).toHaveStyle({ overflow: 'hidden' });
  });

  it('keeps the mini input after the list once messages exist', () => {
    mockConversationState.displayMessageIds = ['message-1'];

    render(<ChatBody />);

    const body = screen.getByTestId('floating-chat-panel-body');
    const list = screen.getByTestId('floating-chat-panel-list');
    const input = screen.getByTestId('floating-chat-input');

    expect(body).toHaveAttribute('data-flex', '1');
    expect(body).toHaveAttribute('data-height', '100%');
    expect(list).toHaveAttribute('data-flex', '1');
    expect(body).toContainElement(list);
    expect(body).toContainElement(input);
    expect(body).toHaveStyle({ overflow: 'hidden' });
    expect(list).toHaveStyle({ overflow: 'hidden' });
    expect(list.compareDocumentPosition(input)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});
