import { type EdgeSpeechPayload } from '@agentasia/tts';
import { EdgeSpeechTTS } from '@agentasia/tts';

import { createSpeechResponse } from '@/server/utils/createSpeechResponse';

export const POST = async (req: Request) => {
  const payload = (await req.json()) as EdgeSpeechPayload;

  return createSpeechResponse(() => EdgeSpeechTTS.createRequest({ payload }), {
    logTag: 'webapi/tts/edge',
    messages: {
      failure: 'Failed to synthesize speech',
      invalid: 'Unexpected payload from Edge speech API',
    },
  });
};
