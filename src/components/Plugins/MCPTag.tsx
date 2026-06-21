import { MCP } from '@agentasia/icons';
import { Tag } from '@agentasia/ui';
import { memo } from 'react';

interface MCPTagProps {
  showIcon?: boolean;
  showText?: boolean;
}

const MCPTag = memo<MCPTagProps>(({ showIcon = true, showText = true }) => {
  return (
    <Tag icon={showIcon && <MCP />} size={'small'}>
      {showText && 'Model Context Protocol'}
    </Tag>
  );
});

export default MCPTag;
