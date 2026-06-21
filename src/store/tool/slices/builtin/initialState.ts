import { builtinSkills } from '@agentasia/builtin-skills';
import { builtinTools, defaultUninstalledBuiltinTools } from '@agentasia/builtin-tools';
import { type BuiltinSkill, type LobeBuiltinTool } from '@agentasia/types';

import { filterBuiltinSkills } from '@/helpers/skillFilters';

export interface BuiltinToolState {
  builtinSkills: BuiltinSkill[];
  builtinToolLoading: Record<string, boolean>;
  builtinTools: LobeBuiltinTool[];
  /**
   * List of uninstalled builtin tool identifiers
   * Empty array means all builtin tools are enabled
   */
  uninstalledBuiltinTools: string[];
  /**
   * Loading state for fetching uninstalled builtin tools
   */
  uninstalledBuiltinToolsLoading: boolean;
}

export const initialBuiltinToolState: BuiltinToolState = {
  builtinSkills: filterBuiltinSkills(builtinSkills),
  builtinToolLoading: {},
  builtinTools,
  uninstalledBuiltinTools: defaultUninstalledBuiltinTools,
  uninstalledBuiltinToolsLoading: true,
};
