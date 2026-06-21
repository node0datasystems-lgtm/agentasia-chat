'use client';

import { createSearchLocalFilesInspector } from '@agentasia/shared-tool-ui/inspectors';

export const SearchLocalFilesInspector = createSearchLocalFilesInspector({
  noResultsKey: 'builtins.lobe-cloud-sandbox.inspector.noResults',
  translationKey: 'builtins.lobe-cloud-sandbox.apiName.searchLocalFiles',
});
