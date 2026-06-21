import { type ToolStoreState } from '../../initialState';
import { type LobehubSkillServer } from './types';
import { LobehubSkillStatus } from './types';

/**
 * AgentAsia Skill Store Selectors
 */
export const agentasiaSkillStoreSelectors = {
  /**
   * Get all AgentAsia Skill server identifiers as a set
   */
  getAllServerIdentifiers: (s: ToolStoreState): Set<string> => {
    const servers = s.agentasiaSkillServers || [];
    return new Set(servers.map((server) => server.identifier));
  },

  /**
   * Get all available tools from all connected servers
   */
  getAllTools: (s: ToolStoreState) => {
    const connectedServers = agentasiaSkillStoreSelectors.getConnectedServers(s);
    return connectedServers.flatMap((server) =>
      (server.tools || []).map((tool) => ({
        ...tool,
        provider: server.identifier,
      })),
    );
  },

  /**
   * Get all connected servers
   */
  getConnectedServers: (s: ToolStoreState): LobehubSkillServer[] =>
    (s.agentasiaSkillServers || []).filter(
      (server) => server.status === LobehubSkillStatus.CONNECTED,
    ),

  /**
   * Get server by identifier
   * @param identifier - Provider identifier (e.g., 'linear')
   */
  getServerByIdentifier: (identifier: string) => (s: ToolStoreState) =>
    s.agentasiaSkillServers?.find((server) => server.identifier === identifier),

  /**
   * Get all AgentAsia Skill servers
   */
  getServers: (s: ToolStoreState): LobehubSkillServer[] => s.agentasiaSkillServers || [],

  /**
   * Check if the given identifier is a AgentAsia Skill server
   * @param identifier - Provider identifier (e.g., 'linear')
   */
  isLobehubSkillServer:
    (identifier: string) =>
    (s: ToolStoreState): boolean => {
      const servers = s.agentasiaSkillServers || [];
      return servers.some((server) => server.identifier === identifier);
    },

  /**
   * Check if a server is loading
   * @param identifier - Provider identifier (e.g., 'linear')
   */
  isServerLoading: (identifier: string) => (s: ToolStoreState) =>
    s.agentasiaSkillLoadingIds?.has(identifier) || false,

  /**
   * Check if a tool is currently executing
   */
  isToolExecuting: (provider: string, toolName: string) => (s: ToolStoreState) => {
    const toolId = `${provider}:${toolName}`;
    return s.agentasiaSkillExecutingToolIds?.has(toolId) || false;
  },

  /**
   * Get all AgentAsia Skill tools as LobeTool format for agent use
   * Converts AgentAsia Skill tools into the format expected by ToolNameResolver
   */
  agentasiaSkillAsLobeTools: (s: ToolStoreState) => {
    const servers = s.agentasiaSkillServers || [];
    const tools: any[] = [];

    for (const server of servers) {
      if (!server.tools || server.status !== LobehubSkillStatus.CONNECTED) continue;

      const apis = server.tools.map((tool) => ({
        description: tool.description || '',
        name: tool.name,
        parameters: tool.inputSchema || {},
      }));

      if (apis.length > 0) {
        tools.push({
          identifier: server.identifier,
          manifest: {
            api: apis,
            author: 'AgentAsia Market',
            homepage: 'https://agentasia.ai/market',
            identifier: server.identifier,
            meta: {
              avatar: server.icon || '🔗',
              description: `AgentAsia Skill: ${server.name}`,
              tags: ['agentasia-skill', server.identifier],
              title: server.name,
            },
            type: 'builtin',
            version: '1.0.0',
          },
          type: 'plugin',
        });
      }
    }

    return tools;
  },

  /**
   * Get metadata list for all connected AgentAsia Skill servers
   * Used by toolSelectors.metaList for unified tool metadata resolution
   */
  metaList: (s: ToolStoreState) => {
    const servers = s.agentasiaSkillServers || [];

    return servers
      .filter((server) => server.status === LobehubSkillStatus.CONNECTED)
      .map((server) => ({
        identifier: server.identifier,
        meta: {
          avatar: server.icon || '🔗',
          description: `AgentAsia Skill: ${server.name}`,
          title: server.name,
        },
      }));
  },
};
