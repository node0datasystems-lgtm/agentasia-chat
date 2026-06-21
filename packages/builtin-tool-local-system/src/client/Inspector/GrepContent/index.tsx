'use client';

import { createGrepContentInspector } from '@agentasia/shared-tool-ui/inspectors';

export const GrepContentInspector = createGrepContentInspector({
  noResultsKey: 'builtins.lobe-local-system.inspector.noResults',
  translationKey: 'builtins.lobe-local-system.apiName.grepContent',
});
