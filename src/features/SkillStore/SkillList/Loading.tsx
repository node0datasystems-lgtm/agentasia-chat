import { Flexbox, Skeleton } from '@agentasia/ui';
import { memo } from 'react';

const Loading = memo(() => {
  return (
    <Flexbox padding={16}>
      <Skeleton active paragraph={{ rows: 8 }} title={false} />
    </Flexbox>
  );
});

export default Loading;
