import { type LobehubSkillServer } from './types';

/**
 * AgentAsia Skill Store state interface
 *
 * NOTE: All connection states and tool data are fetched in real-time from Market API, not stored in local database
 */
export interface LobehubSkillStoreState {
  /** Set of executing tool call IDs */
  agentasiaSkillExecutingToolIds: Set<string>;
  /** Set of loading Provider IDs */
  agentasiaSkillLoadingIds: Set<string>;
  /** List of connected AgentAsia Skill Servers */
  agentasiaSkillServers: LobehubSkillServer[];
}

/**
 * AgentAsia Skill Store initial state
 */
export const initialLobehubSkillStoreState: LobehubSkillStoreState = {
  agentasiaSkillExecutingToolIds: new Set(),
  agentasiaSkillLoadingIds: new Set(),
  agentasiaSkillServers: [],
};
