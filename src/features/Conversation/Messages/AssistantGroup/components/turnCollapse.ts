export interface TurnCollapseInput {
  /** Whether the turn is still streaming. */
  isGenerating: boolean;
  /** Whether this is the latest message in the conversation. */
  isLatestItem: boolean;
  /** Ephemeral user override: `undefined` follows the default, `true`/`false` pin it. */
  userExpanded: boolean | undefined;
}

export interface TurnCollapseState {
  /** Whether the turn is collapsed into the compact summary right now. */
  collapsed: boolean;
  /** Whether the turn participates in history folding (offers a collapse control). */
  foldable: boolean;
}

/**
 * Codex-style history folding for agent turns. A finished, non-latest turn
 * folds by default so the conversation stays focused on the latest result;
 * the latest turn and any still-generating turn always stay expanded. A user
 * toggle (`userExpanded`) overrides the default but is never persisted.
 */
export const resolveTurnCollapse = ({
  isLatestItem,
  isGenerating,
  userExpanded,
}: TurnCollapseInput): TurnCollapseState => {
  const foldable = !isLatestItem && !isGenerating;
  const collapsed = userExpanded === undefined ? foldable : !userExpanded;
  return { collapsed, foldable };
};
