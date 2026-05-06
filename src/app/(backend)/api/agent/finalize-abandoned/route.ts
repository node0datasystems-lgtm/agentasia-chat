import debug from 'debug';
import { type NextRequest, NextResponse } from 'next/server';

import { getServerDB } from '@/database/core/db-adaptor';
import { verifyQStashSignature } from '@/libs/qstash';
import { AbandonOperationService } from '@/server/services/agentRuntime';

const log = debug('api-route:agent:finalize-abandoned');

/**
 * Reverse-trigger finalization for an operation whose Vercel function was
 * killed mid-flight. Called by the agent-gateway DO inactivity watchdog when
 * an op has gone silent past the threshold — see LOBE-8533.
 *
 * Body: `{ operationId: string, reason: string }`
 *
 * Response shape mirrors `FinalizeAbandonedResult` from AbandonOperationService.
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  const rawBody = await request.text();

  const isValidSignature = await verifyQStashSignature(request, rawBody);
  if (!isValidSignature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let body: { operationId?: string; reason?: string };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { operationId, reason } = body;
  if (!operationId) {
    return NextResponse.json({ error: 'operationId is required' }, { status: 400 });
  }
  if (!reason) {
    return NextResponse.json({ error: 'reason is required' }, { status: 400 });
  }

  log('[%s] finalize-abandoned (reason=%s)', operationId, reason);

  try {
    const serverDB = await getServerDB();
    const service = new AbandonOperationService(serverDB);
    const result = await service.finalizeAbandoned(operationId, reason);

    const executionTime = Date.now() - startTime;
    log('[%s] finalize-abandoned done in %dms: %O', operationId, executionTime, result);

    return NextResponse.json({ ...result, executionTime, operationId, reason });
  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    console.error('[finalize-abandoned] %O', error);
    return NextResponse.json({ error: error.message, executionTime, operationId }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    healthy: true,
    message: 'Agent finalize-abandoned endpoint is running',
    timestamp: new Date().toISOString(),
  });
}
