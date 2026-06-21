import type { BuiltinSkill } from '@agentasia/types';

import { AgentBrowserSkill } from './agent-browser';
import { ArtifactsSkill } from './artifacts';
import { AgentAsiaSkill } from './agentasia';
import { TaskSkill } from './task';

export { AgentBrowserIdentifier } from './agent-browser';
export { ArtifactsIdentifier } from './artifacts';
export { AgentAsiaIdentifier } from './agentasia';
export { TaskIdentifier } from './task';

export const builtinSkills: BuiltinSkill[] = [
  AgentBrowserSkill,
  ArtifactsSkill,
  AgentAsiaSkill,
  TaskSkill,
  // FindSkillsSkill
];
