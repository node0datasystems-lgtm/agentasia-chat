import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { MouseEventHandler, ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ProSettingsStep from './ProSettingsStep';

vi.mock('@lobehub/ui', () => ({
  Button: ({
    children,
    disabled,
    onClick,
  }: {
    children: ReactNode;
    disabled?: boolean;
    onClick?: MouseEventHandler<HTMLButtonElement>;
  }) => (
    <button disabled={disabled} type="button" onClick={onClick}>
      {children}
    </button>
  ),
  Flexbox: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      (
        {
          back: 'Back',
          next: 'Next',
          'proSettings.connectors.title': 'Connect Your Favorite Tools',
          'proSettings.model.title': 'Default Model Used by the Agent',
        } as Record<string, string>
      )[key] ?? key,
  }),
}));

vi.mock('@/features/ModelSelect', () => ({
  default: () => <div>ModelSelect</div>,
}));

vi.mock('@/routes/onboarding/components/LobeMessage', () => ({
  default: ({ sentences }: { sentences: string[] }) => <div>{sentences.join(' / ')}</div>,
}));

vi.mock('../components/KlavisServerList', () => ({
  default: () => <div>KlavisServerList</div>,
}));

afterEach(() => {
  cleanup();
});

describe('ProSettingsStep', () => {
  it('uses the connector title as the step title and renders the Klavis server list', () => {
    render(<ProSettingsStep onBack={vi.fn()} onNext={vi.fn()} />);

    expect(screen.getAllByText('Connect Your Favorite Tools')).toHaveLength(1);
    expect(screen.getByText('KlavisServerList')).toBeInTheDocument();
  });

  it('does not allow configuring the default agent model during classic onboarding', () => {
    render(<ProSettingsStep onBack={vi.fn()} onNext={vi.fn()} />);

    expect(screen.queryByText('Default Model Used by the Agent')).not.toBeInTheDocument();
    expect(screen.queryByText('ModelSelect')).not.toBeInTheDocument();
  });

  it('calls the provided navigation handlers', () => {
    const onBack = vi.fn();
    const onNext = vi.fn();

    render(<ProSettingsStep onBack={onBack} onNext={onNext} />);

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalledTimes(1);

    cleanup();

    render(<ProSettingsStep onBack={onBack} onNext={onNext} />);

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
