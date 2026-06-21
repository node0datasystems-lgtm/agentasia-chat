import { registerBuiltinToolSurfaces as registerSurfaces } from '@agentasia/builtin-tools/register';

let registered = false;

export const registerBuiltinToolSurfaces = () => {
  if (registered) return;
  registered = true;

  registerSurfaces();
};
