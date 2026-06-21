import { useToolRenderCapabilities } from '@agentasia/shared-tool-ui';
import type { SearchFilesState } from '@agentasia/tool-runtime';
import { memo } from 'react';

import SearchView from './SearchView';

interface SearchQueryViewProps {
  args: any;
  messageId: string;
  pluginState?: SearchFilesState;
}

const SearchQueryView = memo<SearchQueryViewProps>(({ messageId, args, pluginState }) => {
  const { isLoading } = useToolRenderCapabilities();
  const loading = isLoading?.(messageId);
  const searchResults = pluginState?.results || [];

  return (
    <SearchView
      defaultQuery={args?.keywords || args?.keyword || args?.query || ''}
      resultsNumber={searchResults.length}
      searching={loading || !pluginState}
    />
  );
});

export default SearchQueryView;
