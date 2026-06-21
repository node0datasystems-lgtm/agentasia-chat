import { pathToFileURL } from 'node:url';

export const filePathToAppUrl = (filePath: string) => {
  return `app://agentasia.ai${pathToFileURL(filePath).pathname}`;
};
