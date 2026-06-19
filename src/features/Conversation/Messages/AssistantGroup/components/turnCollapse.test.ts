import { describe, expect, it } from 'vitest';

import { resolveTurnCollapse } from './turnCollapse';

describe('resolveTurnCollapse', () => {
  it('folds a finished, non-latest turn by default', () => {
    expect(
      resolveTurnCollapse({ isGenerating: false, isLatestItem: false, userExpanded: undefined }),
    ).toEqual({ collapsed: true, foldable: true });
  });

  it('keeps the latest turn expanded', () => {
    expect(
      resolveTurnCollapse({ isGenerating: false, isLatestItem: true, userExpanded: undefined }),
    ).toEqual({ collapsed: false, foldable: false });
  });

  it('never folds a still-generating turn', () => {
    expect(
      resolveTurnCollapse({ isGenerating: true, isLatestItem: false, userExpanded: undefined }),
    ).toEqual({ collapsed: false, foldable: false });
  });

  it('respects a user expand on a foldable turn (still foldable)', () => {
    expect(
      resolveTurnCollapse({ isGenerating: false, isLatestItem: false, userExpanded: true }),
    ).toEqual({ collapsed: false, foldable: true });
  });

  it('respects a user collapse on a foldable turn', () => {
    expect(
      resolveTurnCollapse({ isGenerating: false, isLatestItem: false, userExpanded: false }),
    ).toEqual({ collapsed: true, foldable: true });
  });

  it('user toggle on the latest turn does not make it foldable history', () => {
    // Latest turn is never auto-folded; a stray override still collapses on demand
    // but the turn is not treated as foldable history chrome.
    expect(
      resolveTurnCollapse({ isGenerating: false, isLatestItem: true, userExpanded: false }),
    ).toEqual({ collapsed: true, foldable: false });
  });
});
