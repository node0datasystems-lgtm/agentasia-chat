import { stylelint } from '@agentasia/lint';

export default {
  ...stylelint,
  rules: {
    'selector-id-pattern': null,
    ...stylelint.rules,
  },
};
