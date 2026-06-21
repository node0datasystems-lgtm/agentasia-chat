import { LobeActivatorManifest } from '@agentasia/builtin-tool-activator';
import { AgentBuilderManifest } from '@agentasia/builtin-tool-agent-builder';
import { AgentDocumentsManifest } from '@agentasia/builtin-tool-agent-documents';
import { AgentManagementManifest } from '@agentasia/builtin-tool-agent-management';
import {
  agentSignalFeedbackIntentManifest,
  agentSignalReflectionManifest,
  agentSignalReviewManifest,
  agentSignalSkillManagementManifest,
} from '@agentasia/builtin-tool-agent-signal';
import { CalculatorManifest } from '@agentasia/builtin-tool-calculator';
import { CloudSandboxManifest } from '@agentasia/builtin-tool-cloud-sandbox';
import { CredsManifest } from '@agentasia/builtin-tool-creds';
import { GroupAgentBuilderManifest } from '@agentasia/builtin-tool-group-agent-builder';
import { GroupManagementManifest } from '@agentasia/builtin-tool-group-management';
import { KnowledgeBaseManifest } from '@agentasia/builtin-tool-knowledge-base';
import { LobeAgentManifest } from '@agentasia/builtin-tool-lobe-agent';
import { LobeDeliveryCheckerManifest } from '@agentasia/builtin-tool-lobe-delivery-checker';
import { LocalSystemManifest } from '@agentasia/builtin-tool-local-system';
import { MemoryManifest } from '@agentasia/builtin-tool-memory';
import { NotebookManifest } from '@agentasia/builtin-tool-notebook';
import { PageAgentManifest } from '@agentasia/builtin-tool-page-agent';
import { selfFeedbackIntentManifest } from '@agentasia/builtin-tool-self-iteration';
import { SkillStoreManifest } from '@agentasia/builtin-tool-skill-store';
import { SkillsManifest } from '@agentasia/builtin-tool-skills';
import { TopicReferenceManifest } from '@agentasia/builtin-tool-topic-reference';
import { UserInteractionManifest } from '@agentasia/builtin-tool-user-interaction';
import { VerifyToolManifest } from '@agentasia/builtin-tool-verify';
import { WebBrowsingManifest } from '@agentasia/builtin-tool-web-browsing';
import { WebOnboardingManifest } from '@agentasia/builtin-tool-web-onboarding';

export const builtinToolIdentifiers: string[] = [
  AgentBuilderManifest.identifier,
  AgentDocumentsManifest.identifier,
  AgentManagementManifest.identifier,
  CalculatorManifest.identifier,
  CloudSandboxManifest.identifier,
  CredsManifest.identifier,
  GroupAgentBuilderManifest.identifier,
  GroupManagementManifest.identifier,
  KnowledgeBaseManifest.identifier,
  LocalSystemManifest.identifier,
  MemoryManifest.identifier,
  NotebookManifest.identifier,
  PageAgentManifest.identifier,
  selfFeedbackIntentManifest.identifier,
  agentSignalReviewManifest.identifier,
  agentSignalReflectionManifest.identifier,
  agentSignalFeedbackIntentManifest.identifier,
  agentSignalSkillManagementManifest.identifier,
  SkillsManifest.identifier,
  SkillStoreManifest.identifier,
  TopicReferenceManifest.identifier,
  LobeActivatorManifest.identifier,
  WebBrowsingManifest.identifier,
  UserInteractionManifest.identifier,
  LobeAgentManifest.identifier,
  WebOnboardingManifest.identifier,
  VerifyToolManifest.identifier,
  LobeDeliveryCheckerManifest.identifier,
];
