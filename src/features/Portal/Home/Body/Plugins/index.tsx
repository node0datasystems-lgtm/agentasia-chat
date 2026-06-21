import { Flexbox, Text } from '@agentasia/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import ArtifactList from './ArtifactList';

export const Artifacts = memo(() => {
  const { t } = useTranslation('portal');

  return (
    <Flexbox gap={8}>
      <Text as={'h5'} style={{ marginInline: 12 }}>
        {t('Plugins')}
      </Text>
      <ArtifactList />
    </Flexbox>
  );
});

export default Artifacts;
