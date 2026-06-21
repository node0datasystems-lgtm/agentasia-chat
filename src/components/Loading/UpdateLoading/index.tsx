import { type IconSize } from '@agentasia/ui';
import { Icon } from '@agentasia/ui';
import { Loader2 } from 'lucide-react';
import { type CSSProperties } from 'react';
import { memo } from 'react';

interface UpdateLoadingProps {
  size?: IconSize;
  style?: CSSProperties;
}

const UpdateLoading = memo<UpdateLoadingProps>(({ size, style }) => {
  return (
    <div style={style}>
      <Icon spin icon={Loader2} size={size} />
    </div>
  );
});

export default UpdateLoading;
