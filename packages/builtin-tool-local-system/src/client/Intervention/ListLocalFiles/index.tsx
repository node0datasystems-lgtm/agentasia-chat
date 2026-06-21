import type { ListLocalFileParams } from '@agentasia/electron-client-ipc';
import type { BuiltinInterventionProps } from '@agentasia/types';
import { Flexbox } from '@agentasia/ui';
import { memo } from 'react';

import { LocalFolder } from '@/features/LocalFile';

import OutOfScopeWarning from '../OutOfScopeWarning';

const ListLocalFiles = memo<BuiltinInterventionProps<ListLocalFileParams>>(({ args }) => {
  const { path } = args;

  return (
    <Flexbox gap={12}>
      <OutOfScopeWarning paths={[path]} />
      <LocalFolder path={path} />
    </Flexbox>
  );
});

ListLocalFiles.displayName = 'ListLocalFilesIntervention';

export default ListLocalFiles;
