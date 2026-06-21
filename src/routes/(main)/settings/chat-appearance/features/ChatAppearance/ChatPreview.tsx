import { BRANDING_NAME } from '@agentasia/business-const';
import { type MarkdownProps } from '@agentasia/ui';
import { Center, Markdown } from '@agentasia/ui';
import { useTranslation } from 'react-i18next';

const ChatPreview = ({ fontSize }: Pick<MarkdownProps, 'fontSize'>) => {
  const { t } = useTranslation('welcome');
  return (
    <Center>
      <Markdown fontSize={fontSize} variant={'chat'}>
        {t('guide.defaultMessageWithoutCreate', {
          appName: BRANDING_NAME,
        })}
      </Markdown>
    </Center>
  );
};

export default ChatPreview;
