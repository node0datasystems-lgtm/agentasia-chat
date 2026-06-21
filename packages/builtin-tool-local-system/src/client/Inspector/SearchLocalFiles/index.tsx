'use client';

import { createSearchLocalFilesInspector } from '@agentasia/shared-tool-ui/inspectors';

export const SearchLocalFilesInspector = createSearchLocalFilesInspector({
  noResultsKey: 'builtins.lobe-local-system.inspector.noResults',
  translationKey: 'builtins.lobe-local-system.apiName.searchLocalFiles',
});
