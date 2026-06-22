/**
 * Lobe Page Agent Executor
 *
 * Creates and exports the PageAgentExecutor instance for registration.
 * Also exports the runtime for editor instance injection.
 */
import { PageAgentExecutor } from '@agentasia/builtin-tool-page-agent/client';
import { EditorRuntime } from '@lobehub/editor-runtime';

// Create singleton instance of the runtime
export const pageAgentRuntime = new EditorRuntime();

// Create executor instance with the runtime
export const pageAgentExecutor = new PageAgentExecutor(pageAgentRuntime);
