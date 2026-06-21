import { type FlexboxProps } from '@agentasia/ui';
import { Flexbox, Text } from '@agentasia/ui';
import { type TypewriterEffectProps } from '@agentasia/ui/awesome';
import { TypewriterEffect } from '@agentasia/ui/awesome';
import { LoadingDots } from '@agentasia/ui/chat';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ProductLogo } from '@/components/Branding';

interface LobeMessageProps extends Omit<FlexboxProps, 'children'> {
  fontSize?: number;
  sentences: TypewriterEffectProps['sentences'];
}

const LobeMessage = memo<LobeMessageProps>(({ sentences, fontSize = 24, ...rest }) => {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  return (
    <Flexbox gap={8} {...rest}>
      <ProductLogo size={fontSize * 2} />
      <Text as={'h1'} fontSize={fontSize} weight={'bold'}>
        <TypewriterEffect
          cursorCharacter={<LoadingDots size={fontSize} variant={'pulse'} />}
          cursorFade={false}
          deletePauseDuration={1000}
          deletingSpeed={32}
          hideCursorWhileTyping={'afterTyping'}
          key={locale}
          pauseDuration={16_000}
          sentences={sentences}
          typingSpeed={64}
        />
      </Text>
    </Flexbox>
  );
});

export default LobeMessage;
