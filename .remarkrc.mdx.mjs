import { remarklint } from '@agentasia/lint';

export default {
  ...remarklint,
  plugins: ['remark-mdx', ...remarklint.plugins, ['remark-lint-file-extension', false]],
};
