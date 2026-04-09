'use client';

import { Accordion, Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import Recents from '@/routes/(main)/home/features/Recents';

import Agent from './Agent';
import BottomMenu from './BottomMenu';
import InboxEntry from './InboxEntry';
import NewAgentButton from './NewAgentButton';

export enum GroupKey {
  Agent = 'agent',
  Project = 'project',
  Recents = 'recents',
}

const Body = memo(() => {
  return (
    <Flexbox flex={1} justify={'space-between'} paddingInline={4}>
      <Flexbox gap={4} style={{ flex: 1, overflow: 'auto' }}>
        <Flexbox gap={1}>
          <InboxEntry />
          <NewAgentButton />
        </Flexbox>
        <Accordion
          defaultExpandedKeys={[GroupKey.Recents, GroupKey.Project, GroupKey.Agent]}
          gap={8}
        >
          <Recents itemKey={GroupKey.Recents} />
          <Agent itemKey={GroupKey.Agent} />
        </Accordion>
      </Flexbox>
      <BottomMenu />
    </Flexbox>
  );
});

export default Body;
