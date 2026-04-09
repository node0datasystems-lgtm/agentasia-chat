import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';
import { Link } from 'react-router-dom';

import SkeletonList from '@/features/NavPanel/components/SkeletonList';
import { useHomeStore } from '@/store/home';
import { homeRecentSelectors } from '@/store/home/selectors';

import RecentListItem from './Item';

const RecentsList = memo(() => {
  const recents = useHomeStore(homeRecentSelectors.recents);
  const isInit = useHomeStore(homeRecentSelectors.isRecentsInit);

  if (!isInit) {
    return <SkeletonList rows={3} />;
  }

  return (
    <Flexbox gap={2}>
      {recents.map((item) => (
        <Link
          key={`${item.type}-${item.id}`}
          style={{ color: 'inherit', textDecoration: 'none' }}
          to={item.routePath}
        >
          <RecentListItem {...item} />
        </Link>
      ))}
    </Flexbox>
  );
});

export default RecentsList;
