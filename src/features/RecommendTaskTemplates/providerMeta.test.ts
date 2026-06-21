import type { TaskTemplateConnectorReference } from '@agentasia/const';
import { describe, expect, it } from 'vitest';

import { findNextUnconnectedSpec, getProviderMeta } from './providerMeta';

describe('getProviderMeta', () => {
  it('resolves agentasia source via LOBEHUB_SKILL_PROVIDERS', () => {
    const meta = getProviderMeta({ identifier: 'github', source: 'agentasia' });
    expect(meta).toMatchObject({ identifier: 'github', label: 'GitHub', source: 'agentasia' });
    expect(meta?.icon).toBeDefined();
  });

  it('resolves notion as a agentasia source provider', () => {
    const meta = getProviderMeta({ identifier: 'notion', source: 'agentasia' });
    expect(meta).toMatchObject({ identifier: 'notion', label: 'Notion', source: 'agentasia' });
    expect(meta?.icon).toBeDefined();
  });

  it('resolves composio source via COMPOSIO_APP_TYPES', () => {
    const meta = getProviderMeta({ identifier: 'gmail', source: 'composio' });
    expect(meta).toMatchObject({ identifier: 'gmail', label: 'Gmail', source: 'composio' });
    expect(meta?.icon).toBeDefined();
  });

  it('returns undefined for unknown provider', () => {
    expect(getProviderMeta({ identifier: 'nonexistent-x', source: 'agentasia' })).toBeUndefined();
    expect(getProviderMeta({ identifier: 'nonexistent-x', source: 'composio' })).toBeUndefined();
  });

  it('does not cross namespaces (agentasia id under composio source returns undefined)', () => {
    // 'github' is a agentasia provider id, not a composio identifier.
    expect(getProviderMeta({ identifier: 'github', source: 'composio' })).toBeUndefined();
  });
});

describe('findNextUnconnectedSpec', () => {
  const allConnected = () => true;
  const noneConnected = () => false;

  it('returns undefined when specs is undefined or empty', () => {
    expect(findNextUnconnectedSpec(undefined, noneConnected)).toBeUndefined();
    expect(findNextUnconnectedSpec([], noneConnected)).toBeUndefined();
  });

  it('returns undefined when all specs are connected', () => {
    const specs: TaskTemplateConnectorReference[] = [
      { identifier: 'github', source: 'agentasia' },
      { identifier: 'notion', source: 'agentasia' },
    ];
    expect(findNextUnconnectedSpec(specs, allConnected)).toBeUndefined();
  });

  it('returns the first spec when none are connected', () => {
    const specs: TaskTemplateConnectorReference[] = [
      { identifier: 'github', source: 'agentasia' },
      { identifier: 'notion', source: 'agentasia' },
    ];
    const result = findNextUnconnectedSpec(specs, noneConnected);
    expect(result?.identifier).toBe('github');
    expect(result?.label).toBe('GitHub');
  });

  it('skips already-connected specs and returns the next missing one in order', () => {
    const specs: TaskTemplateConnectorReference[] = [
      { identifier: 'github', source: 'agentasia' },
      { identifier: 'linear', source: 'agentasia' },
      { identifier: 'notion', source: 'agentasia' },
    ];
    const isConnected = (s: TaskTemplateConnectorReference) =>
      s.identifier === 'github' || s.identifier === 'linear';
    const result = findNextUnconnectedSpec(specs, isConnected);
    expect(result?.identifier).toBe('notion');
    expect(result?.source).toBe('agentasia');
  });

  it('skips specs with unknown providers (no meta) and continues searching', () => {
    const specs: TaskTemplateConnectorReference[] = [
      { identifier: 'nonexistent-x', source: 'agentasia' },
      { identifier: 'notion', source: 'agentasia' },
    ];
    const result = findNextUnconnectedSpec(specs, noneConnected);
    expect(result?.identifier).toBe('notion');
  });
});
