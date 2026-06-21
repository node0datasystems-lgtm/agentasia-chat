import { describe, expect, it } from 'vitest';

import { initialState } from '../../initialState';
import { type ToolStore } from '../../store';
import { agentasiaSkillStoreSelectors } from './selectors';
import { type LobehubSkillServer } from './types';
import { LobehubSkillStatus } from './types';

describe('agentasiaSkillStoreSelectors', () => {
  describe('getServers', () => {
    it('should return empty array when no servers exist', () => {
      const state = { ...initialState } as ToolStore;
      const result = agentasiaSkillStoreSelectors.getServers(state);
      expect(result).toEqual([]);
    });

    it('should return all servers', () => {
      const servers: LobehubSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: true,
          status: LobehubSkillStatus.CONNECTED,
        },
        {
          identifier: 'github',
          name: 'GitHub',
          isConnected: false,
          status: LobehubSkillStatus.NOT_CONNECTED,
        },
      ];
      const state = { ...initialState, agentasiaSkillServers: servers } as ToolStore;
      const result = agentasiaSkillStoreSelectors.getServers(state);
      expect(result).toEqual(servers);
    });

    it('should handle undefined agentasiaSkillServers', () => {
      const state = { ...initialState, agentasiaSkillServers: undefined } as unknown as ToolStore;
      const result = agentasiaSkillStoreSelectors.getServers(state);
      expect(result).toEqual([]);
    });
  });

  describe('getConnectedServers', () => {
    it('should return only connected servers', () => {
      const servers: LobehubSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: true,
          status: LobehubSkillStatus.CONNECTED,
        },
        {
          identifier: 'github',
          name: 'GitHub',
          isConnected: false,
          status: LobehubSkillStatus.NOT_CONNECTED,
        },
        {
          identifier: 'slack',
          name: 'Slack',
          isConnected: false,
          status: LobehubSkillStatus.ERROR,
        },
      ];
      const state = { ...initialState, agentasiaSkillServers: servers } as ToolStore;
      const result = agentasiaSkillStoreSelectors.getConnectedServers(state);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Linear');
    });

    it('should return empty array when no servers are connected', () => {
      const servers: LobehubSkillServer[] = [
        {
          identifier: 'github',
          name: 'GitHub',
          isConnected: false,
          status: LobehubSkillStatus.NOT_CONNECTED,
        },
      ];
      const state = { ...initialState, agentasiaSkillServers: servers } as ToolStore;
      const result = agentasiaSkillStoreSelectors.getConnectedServers(state);
      expect(result).toEqual([]);
    });

    it('should return empty array when no servers exist', () => {
      const state = { ...initialState } as ToolStore;
      const result = agentasiaSkillStoreSelectors.getConnectedServers(state);
      expect(result).toEqual([]);
    });
  });

  describe('getAllServerIdentifiers', () => {
    it('should return set of all server identifiers', () => {
      const servers: LobehubSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: true,
          status: LobehubSkillStatus.CONNECTED,
        },
        {
          identifier: 'github',
          name: 'GitHub',
          isConnected: false,
          status: LobehubSkillStatus.NOT_CONNECTED,
        },
      ];
      const state = { ...initialState, agentasiaSkillServers: servers } as ToolStore;
      const result = agentasiaSkillStoreSelectors.getAllServerIdentifiers(state);
      expect(result).toEqual(new Set(['linear', 'github']));
    });

    it('should return empty set when no servers exist', () => {
      const state = { ...initialState } as ToolStore;
      const result = agentasiaSkillStoreSelectors.getAllServerIdentifiers(state);
      expect(result).toEqual(new Set());
    });
  });

  describe('getServerByIdentifier', () => {
    it('should return server by identifier', () => {
      const servers: LobehubSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: true,
          status: LobehubSkillStatus.CONNECTED,
        },
      ];
      const state = { ...initialState, agentasiaSkillServers: servers } as ToolStore;
      const result = agentasiaSkillStoreSelectors.getServerByIdentifier('linear')(state);
      expect(result?.identifier).toBe('linear');
      expect(result?.name).toBe('Linear');
    });

    it('should return undefined when server not found', () => {
      const state = { ...initialState } as ToolStore;
      const result = agentasiaSkillStoreSelectors.getServerByIdentifier('non-existent')(state);
      expect(result).toBeUndefined();
    });

    it('should return undefined when agentasiaSkillServers is undefined', () => {
      const state = { ...initialState, agentasiaSkillServers: undefined } as unknown as ToolStore;
      const result = agentasiaSkillStoreSelectors.getServerByIdentifier('linear')(state);
      expect(result).toBeUndefined();
    });
  });

  describe('isLobehubSkillServer', () => {
    it('should return true for existing server', () => {
      const servers: LobehubSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: true,
          status: LobehubSkillStatus.CONNECTED,
        },
      ];
      const state = { ...initialState, agentasiaSkillServers: servers } as ToolStore;
      const result = agentasiaSkillStoreSelectors.isLobehubSkillServer('linear')(state);
      expect(result).toBe(true);
    });

    it('should return false for non-existing server', () => {
      const state = { ...initialState } as ToolStore;
      const result = agentasiaSkillStoreSelectors.isLobehubSkillServer('non-existent')(state);
      expect(result).toBe(false);
    });

    it('should return false when agentasiaSkillServers is undefined', () => {
      const state = { ...initialState, agentasiaSkillServers: undefined } as unknown as ToolStore;
      const result = agentasiaSkillStoreSelectors.isLobehubSkillServer('linear')(state);
      expect(result).toBe(false);
    });
  });

  describe('isServerLoading', () => {
    it('should return true when server is loading', () => {
      const state = {
        ...initialState,
        agentasiaSkillLoadingIds: new Set(['linear']),
      } as ToolStore;
      const result = agentasiaSkillStoreSelectors.isServerLoading('linear')(state);
      expect(result).toBe(true);
    });

    it('should return false when server is not loading', () => {
      const state = {
        ...initialState,
        agentasiaSkillLoadingIds: new Set(),
      } as ToolStore;
      const result = agentasiaSkillStoreSelectors.isServerLoading('linear')(state);
      expect(result).toBe(false);
    });

    it('should return false when agentasiaSkillLoadingIds is undefined', () => {
      const state = {
        ...initialState,
        agentasiaSkillLoadingIds: undefined,
      } as unknown as ToolStore;
      const result = agentasiaSkillStoreSelectors.isServerLoading('linear')(state);
      expect(result).toBe(false);
    });
  });

  describe('isToolExecuting', () => {
    it('should return true when tool is executing', () => {
      const state = {
        ...initialState,
        agentasiaSkillExecutingToolIds: new Set(['linear:createIssue']),
      } as ToolStore;
      const result = agentasiaSkillStoreSelectors.isToolExecuting('linear', 'createIssue')(state);
      expect(result).toBe(true);
    });

    it('should return false when tool is not executing', () => {
      const state = {
        ...initialState,
        agentasiaSkillExecutingToolIds: new Set(),
      } as ToolStore;
      const result = agentasiaSkillStoreSelectors.isToolExecuting('linear', 'createIssue')(state);
      expect(result).toBe(false);
    });

    it('should return false for different tool', () => {
      const state = {
        ...initialState,
        agentasiaSkillExecutingToolIds: new Set(['linear:createIssue']),
      } as ToolStore;
      const result = agentasiaSkillStoreSelectors.isToolExecuting('linear', 'listIssues')(state);
      expect(result).toBe(false);
    });

    it('should return false when agentasiaSkillExecutingToolIds is undefined', () => {
      const state = {
        ...initialState,
        agentasiaSkillExecutingToolIds: undefined,
      } as unknown as ToolStore;
      const result = agentasiaSkillStoreSelectors.isToolExecuting('linear', 'createIssue')(state);
      expect(result).toBe(false);
    });
  });

  describe('getAllTools', () => {
    it('should return all tools from connected servers', () => {
      const servers: LobehubSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: true,
          status: LobehubSkillStatus.CONNECTED,
          tools: [
            { name: 'createIssue', description: 'Create issue', inputSchema: { type: 'object' } },
            { name: 'listIssues', description: 'List issues', inputSchema: { type: 'object' } },
          ],
        },
        {
          identifier: 'github',
          name: 'GitHub',
          isConnected: false,
          status: LobehubSkillStatus.NOT_CONNECTED,
          tools: [{ name: 'createPR', description: 'Create PR', inputSchema: { type: 'object' } }],
        },
      ];
      const state = { ...initialState, agentasiaSkillServers: servers } as ToolStore;
      const result = agentasiaSkillStoreSelectors.getAllTools(state);

      // Only tools from connected server (Linear) should be returned
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('createIssue');
      expect(result[0].provider).toBe('linear');
      expect(result[1].name).toBe('listIssues');
      expect(result[1].provider).toBe('linear');
    });

    it('should return empty array when no connected servers have tools', () => {
      const servers: LobehubSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: true,
          status: LobehubSkillStatus.CONNECTED,
        },
      ];
      const state = { ...initialState, agentasiaSkillServers: servers } as ToolStore;
      const result = agentasiaSkillStoreSelectors.getAllTools(state);
      expect(result).toEqual([]);
    });

    it('should return empty array when no servers exist', () => {
      const state = { ...initialState } as ToolStore;
      const result = agentasiaSkillStoreSelectors.getAllTools(state);
      expect(result).toEqual([]);
    });

    it('should combine tools from multiple connected servers', () => {
      const servers: LobehubSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: true,
          status: LobehubSkillStatus.CONNECTED,
          tools: [
            { name: 'createIssue', description: 'Create issue', inputSchema: { type: 'object' } },
          ],
        },
        {
          identifier: 'github',
          name: 'GitHub',
          isConnected: true,
          status: LobehubSkillStatus.CONNECTED,
          tools: [{ name: 'createPR', description: 'Create PR', inputSchema: { type: 'object' } }],
        },
      ];
      const state = { ...initialState, agentasiaSkillServers: servers } as ToolStore;
      const result = agentasiaSkillStoreSelectors.getAllTools(state);

      expect(result).toHaveLength(2);
      expect(result[0].provider).toBe('linear');
      expect(result[1].provider).toBe('github');
    });
  });

  describe('agentasiaSkillAsLobeTools', () => {
    it('should convert connected servers with tools to LobeTool format', () => {
      const servers: LobehubSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          icon: 'linear-icon',
          isConnected: true,
          status: LobehubSkillStatus.CONNECTED,
          tools: [
            { name: 'createIssue', description: 'Create issue', inputSchema: { type: 'object' } },
          ],
        },
      ];
      const state = { ...initialState, agentasiaSkillServers: servers } as ToolStore;
      const result = agentasiaSkillStoreSelectors.agentasiaSkillAsLobeTools(state);

      expect(result).toHaveLength(1);
      expect(result[0].identifier).toBe('linear');
      expect(result[0].type).toBe('plugin');
      expect(result[0].manifest.api).toHaveLength(1);
      expect(result[0].manifest.api[0].name).toBe('createIssue');
      expect(result[0].manifest.meta.title).toBe('Linear');
      expect(result[0].manifest.meta.avatar).toBe('linear-icon');
    });

    it('should not include disconnected servers', () => {
      const servers: LobehubSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: false,
          status: LobehubSkillStatus.NOT_CONNECTED,
          tools: [
            { name: 'createIssue', description: 'Create issue', inputSchema: { type: 'object' } },
          ],
        },
      ];
      const state = { ...initialState, agentasiaSkillServers: servers } as ToolStore;
      const result = agentasiaSkillStoreSelectors.agentasiaSkillAsLobeTools(state);
      expect(result).toEqual([]);
    });

    it('should not include servers without tools', () => {
      const servers: LobehubSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: true,
          status: LobehubSkillStatus.CONNECTED,
        },
      ];
      const state = { ...initialState, agentasiaSkillServers: servers } as ToolStore;
      const result = agentasiaSkillStoreSelectors.agentasiaSkillAsLobeTools(state);
      expect(result).toEqual([]);
    });

    it('should not include servers with empty tools array', () => {
      const servers: LobehubSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: true,
          status: LobehubSkillStatus.CONNECTED,
          tools: [],
        },
      ];
      const state = { ...initialState, agentasiaSkillServers: servers } as ToolStore;
      const result = agentasiaSkillStoreSelectors.agentasiaSkillAsLobeTools(state);
      expect(result).toEqual([]);
    });

    it('should use default avatar when icon is not provided', () => {
      const servers: LobehubSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: true,
          status: LobehubSkillStatus.CONNECTED,
          tools: [
            { name: 'createIssue', description: 'Create issue', inputSchema: { type: 'object' } },
          ],
        },
      ];
      const state = { ...initialState, agentasiaSkillServers: servers } as ToolStore;
      const result = agentasiaSkillStoreSelectors.agentasiaSkillAsLobeTools(state);

      expect(result[0].manifest.meta.avatar).toBe('🔗');
    });

    it('should include all apis from server', () => {
      const servers: LobehubSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: true,
          status: LobehubSkillStatus.CONNECTED,
          tools: [
            { name: 'createIssue', description: 'Create issue', inputSchema: { type: 'object' } },
            { name: 'listIssues', description: 'List issues', inputSchema: { type: 'object' } },
            { name: 'updateIssue', description: 'Update issue', inputSchema: { type: 'object' } },
          ],
        },
      ];
      const state = { ...initialState, agentasiaSkillServers: servers } as ToolStore;
      const result = agentasiaSkillStoreSelectors.agentasiaSkillAsLobeTools(state);

      expect(result[0].manifest.api).toHaveLength(3);
      expect(result[0].manifest.api[0].name).toBe('createIssue');
      expect(result[0].manifest.api[1].name).toBe('listIssues');
      expect(result[0].manifest.api[2].name).toBe('updateIssue');
    });

    it('should handle undefined description in tools', () => {
      const servers: LobehubSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: true,
          status: LobehubSkillStatus.CONNECTED,
          tools: [{ name: 'createIssue', inputSchema: { type: 'object' } }],
        },
      ];
      const state = { ...initialState, agentasiaSkillServers: servers } as ToolStore;
      const result = agentasiaSkillStoreSelectors.agentasiaSkillAsLobeTools(state);

      expect(result[0].manifest.api[0].description).toBe('');
    });
  });

  describe('metaList', () => {
    it('should return metadata for connected servers', () => {
      const servers: LobehubSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          icon: 'linear-icon',
          isConnected: true,
          status: LobehubSkillStatus.CONNECTED,
        },
        {
          identifier: 'github',
          name: 'GitHub',
          icon: 'github-icon',
          isConnected: false,
          status: LobehubSkillStatus.NOT_CONNECTED,
        },
      ];
      const state = { ...initialState, agentasiaSkillServers: servers } as ToolStore;
      const result = agentasiaSkillStoreSelectors.metaList(state);

      expect(result).toHaveLength(1);
      expect(result[0].identifier).toBe('linear');
      expect(result[0].meta.title).toBe('Linear');
      expect(result[0].meta.avatar).toBe('linear-icon');
      expect(result[0].meta.description).toBe('AgentAsia Skill: Linear');
    });

    it('should return empty array when no connected servers', () => {
      const servers: LobehubSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: false,
          status: LobehubSkillStatus.NOT_CONNECTED,
        },
      ];
      const state = { ...initialState, agentasiaSkillServers: servers } as ToolStore;
      const result = agentasiaSkillStoreSelectors.metaList(state);
      expect(result).toEqual([]);
    });

    it('should return empty array when no servers exist', () => {
      const state = { ...initialState } as ToolStore;
      const result = agentasiaSkillStoreSelectors.metaList(state);
      expect(result).toEqual([]);
    });

    it('should use default avatar when icon is not provided', () => {
      const servers: LobehubSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          isConnected: true,
          status: LobehubSkillStatus.CONNECTED,
        },
      ];
      const state = { ...initialState, agentasiaSkillServers: servers } as ToolStore;
      const result = agentasiaSkillStoreSelectors.metaList(state);

      expect(result[0].meta.avatar).toBe('🔗');
    });

    it('should return metadata for multiple connected servers', () => {
      const servers: LobehubSkillServer[] = [
        {
          identifier: 'linear',
          name: 'Linear',
          icon: 'linear-icon',
          isConnected: true,
          status: LobehubSkillStatus.CONNECTED,
        },
        {
          identifier: 'github',
          name: 'GitHub',
          icon: 'github-icon',
          isConnected: true,
          status: LobehubSkillStatus.CONNECTED,
        },
        {
          identifier: 'slack',
          name: 'Slack',
          icon: 'slack-icon',
          isConnected: true,
          status: LobehubSkillStatus.CONNECTED,
        },
      ];
      const state = { ...initialState, agentasiaSkillServers: servers } as ToolStore;
      const result = agentasiaSkillStoreSelectors.metaList(state);

      expect(result).toHaveLength(3);
      expect(result.map((r) => r.identifier)).toEqual(['linear', 'github', 'slack']);
    });
  });
});
