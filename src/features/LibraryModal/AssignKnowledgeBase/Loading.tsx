import { Flexbox, Skeleton } from '@agentasia/ui';
import { memo } from 'react';

const Loading = memo(() => {
  return (
    <Flexbox>
      <Skeleton paragraph={{ rows: 8 }} title={false} />
    </Flexbox>
  );
});

export default Loading;
