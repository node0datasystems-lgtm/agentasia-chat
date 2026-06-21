'use client';

import { ProviderIcon } from '@agentasia/icons';
import { Button, DropdownMenu, Icon } from '@agentasia/ui';
import { Dropdown } from 'antd';
import { createStaticStyles } from 'antd-style';
import { ChevronDownIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import urlJoin from 'url-join';

import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import WorkspaceLink from '@/features/Workspace/WorkspaceLink';

import { useDetailContext } from '../../DetailProvider';

const styles = createStaticStyles(({ css }) => ({
  button: css`
    button {
      width: 100%;
    }
  `,
}));

const ChatWithModel = memo(() => {
  const { t } = useTranslation('discover');
  const { providers = [] } = useDetailContext();
  const includeAgentAsia = providers.some((item) => item.id === 'agentasia');
  const navigate = useWorkspaceAwareNavigate();
  const list = providers.filter((provider) => provider.id !== 'agentasia');

  const items = list.map((item) => ({
    icon: <ProviderIcon provider={item.id} size={20} type={'avatar'} />,
    key: item.id,
    label: (
      <WorkspaceLink to={urlJoin('/community/provider', item.id)}>
        {[item.name, t('models.guide')].join(' ')}
      </WorkspaceLink>
    ),
  }));

  const handleAgentAsiaChat = () => {
    navigate('/agent');
  };

  if (includeAgentAsia)
    return (
      <Dropdown.Button
        className={styles.button}
        icon={<Icon icon={ChevronDownIcon} />}
        overlayStyle={{ minWidth: 267 }}
        size={'large'}
        style={{ flex: 1, width: 'unset' }}
        type={'primary'}
        menu={{
          items,
        }}
        onClick={handleAgentAsiaChat}
      >
        {t('models.chat')}
      </Dropdown.Button>
    );

  if (items.length === 1)
    return (
      <WorkspaceLink style={{ flex: 1 }} to={urlJoin('/community/provider', items[0].key)}>
        <Button block className={styles.button} size={'large'} type={'primary'}>
          {t('models.guide')}
        </Button>
      </WorkspaceLink>
    );

  return (
    <DropdownMenu data-no-highlight items={items}>
      <Button
        className={styles.button}
        size={'large'}
        style={{ flex: 1, width: 'unset' }}
        type={'primary'}
      >
        {t('models.guide')}
      </Button>
    </DropdownMenu>
  );
});

export default ChatWithModel;
