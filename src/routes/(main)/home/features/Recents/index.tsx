import { AccordionItem, Flexbox, Text } from '@lobehub/ui';
import { memo, Suspense } from 'react';
import { useTranslation } from 'react-i18next';

import NeuralNetworkLoading from '@/components/NeuralNetworkLoading';
import SkeletonList from '@/features/NavPanel/components/SkeletonList';
import { useInitRecents } from '@/hooks/useInitRecents';
import { useHomeStore } from '@/store/home';
import { homeRecentSelectors } from '@/store/home/selectors';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/slices/auth/selectors';

import RecentsList from './List';

interface RecentsProps {
  itemKey: string;
}

const Recents = memo<RecentsProps>(({ itemKey }) => {
  const { t } = useTranslation('common');
  const recents = useHomeStore(homeRecentSelectors.recents);
  const isInit = useHomeStore(homeRecentSelectors.isRecentsInit);
  const isLogin = useUserStore(authSelectors.isLogin);
  const { isRevalidating } = useInitRecents();

  if (!isLogin) return null;
  if (isInit && (!recents || recents.length === 0)) return null;

  return (
    <AccordionItem
      itemKey={itemKey}
      paddingBlock={4}
      paddingInline={'8px 4px'}
      title={
        <Flexbox horizontal align="center" gap={4}>
          <Text ellipsis fontSize={12} type={'secondary'} weight={500}>
            {t('recents')}
          </Text>
          {isRevalidating && <NeuralNetworkLoading size={14} />}
        </Flexbox>
      }
    >
      <Suspense fallback={<SkeletonList rows={3} />}>
        <RecentsList />
      </Suspense>
    </AccordionItem>
  );
});

export default Recents;
