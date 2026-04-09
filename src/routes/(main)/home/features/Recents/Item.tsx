import { CheckSquareIcon, FileIcon, FileTextIcon, HashIcon } from 'lucide-react';
import { memo } from 'react';

import NavItem from '@/features/NavPanel/components/NavItem';
import { type RecentItem } from '@/server/routers/lambda/recent';

const TYPE_ICON_MAP = {
  document: FileTextIcon,
  file: FileIcon,
  task: CheckSquareIcon,
  topic: HashIcon,
};

const RecentListItem = memo<RecentItem>(({ title, type }) => {
  const IconComponent = TYPE_ICON_MAP[type] || FileIcon;

  return <NavItem icon={IconComponent} title={title} />;
});

export default RecentListItem;
