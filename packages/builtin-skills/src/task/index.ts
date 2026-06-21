import type { BuiltinSkill } from '@agentasia/types';

import { toResourceMeta } from '../agentasia/helpers';
import commands from './references/commands.md';
import content from './SKILL.md';

export const TaskIdentifier = 'task';

export const TaskSkill: BuiltinSkill = {
  avatar: '📋',
  content,
  description: 'Task management and execution — create, track, review, and complete tasks via CLI.',
  identifier: TaskIdentifier,
  name: 'Task',
  resources: toResourceMeta({
    'references/commands': commands,
  }),
  source: 'builtin',
};
