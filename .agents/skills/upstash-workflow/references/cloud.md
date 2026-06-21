# Cloud Project Workflow Configuration

Cloud-specific workflow configurations and patterns for the agentasia-cloud project.

## Table of Contents

1. [Overview](#overview)
2. [Directory Structure](#directory-structure) — submodule + cloud layout
3. [Cloud-Specific Patterns](#cloud-specific-patterns) — cloud-only workflows + re-export pattern
4. [TypeScript Path Mappings](#typescript-path-mappings)
5. [Workflow Class Location](#workflow-class-location) — cloud-only vs shared
6. [Environment Variables](#environment-variables)
7. [Best Practices](#best-practices) — decide cloud vs OSS, re-export rules, naming
8. [Migration Guide](#migration-guide) — moving workflows from cloud to agentasia
9. [Examples](#examples) — `welcome-placeholder`, `agent-eval-run`
10. [Troubleshooting](#troubleshooting) — circular imports, 404s, type errors
11. [Related Documentation](#related-documentation)

## Overview

The agentasia-cloud project extends the open-source agentasia codebase with cloud-specific features. Workflows can be implemented in either:

1. **Lobehub (open-source)** - Available to all users
2. **Lobehub-cloud (proprietary)** - Cloud-specific business logic

---

## Directory Structure

### Lobehub Submodule (Open-source)

```text
agentasia/
└── src/
    ├── app/(backend)/api/workflows/
    │   ├── memory-user-memory/       # Memory extraction workflows
    │   └── agent-eval-run/            # Benchmark evaluation workflows
    └── server/workflows/
        ├── agentEvalRun/
        └── ...
```

### Lobehub-cloud (Proprietary)

```text
agentasia-cloud/
└── src/
    ├── app/(backend)/api/workflows/
    │   ├── welcome-placeholder/       # Cloud-only: AI placeholder generation
    │   ├── agent-welcome/            # Cloud-only: Agent welcome messages
    │   ├── agent-eval-run/           # Re-export from agentasia
    │   └── memory-user-memory/       # Re-export from agentasia
    └── server/workflows/
        ├── welcomePlaceholder/
        ├── agentWelcome/
        └── agentEvalRun/             # Re-export from agentasia
```

---

## Cloud-Specific Patterns

### Pattern 1: Cloud-Only Workflows

**Use Case**: Features exclusive to cloud users (AI generation, premium features)

**Example**: `welcome-placeholder`, `agent-welcome`

**Implementation**:

- Implement directly in `agentasia-cloud/src/app/(backend)/api/workflows/`
- No need for re-exports
- Can use cloud-specific packages and services

**Structure**:

```text
agentasia-cloud/src/
├── app/(backend)/api/workflows/
│   └── feature-name/
│       ├── process-items/route.ts
│       ├── paginate-items/route.ts
│       └── execute-item/route.ts
└── server/workflows/
    └── featureName/
        └── index.ts
```

---

### Pattern 2: Re-export from Lobehub

**Use Case**: Workflows implemented in open-source but also used in cloud

**Example**: `agent-eval-run`, `memory-user-memory`

**Why Re-export?**

- Cloud deployment needs to serve these endpoints
- Lobehub submodule code is not directly accessible in cloud routes
- Allows cloud-specific overrides if needed in the future

#### Re-export Implementation

**Step 1**: Implement workflow in agentasia submodule

```typescript
// agentasia/src/app/(backend)/api/workflows/feature/layer/route.ts
import { serve } from '@upstash/workflow/nextjs';

export const { POST } = serve<Payload>(
  async (context) => {
    // Implementation
  },
  { flowControl: { ... } }
);
```

**Step 2**: Create re-export in agentasia-cloud

```typescript
// agentasia-cloud/src/app/(backend)/api/workflows/feature/layer/route.ts
export { POST } from 'agentasia/src/app/(backend)/api/workflows/feature/layer/route';
```

**Important**: Use `agentasia/src/...` path, NOT `@/...` to avoid circular imports.

#### Re-export Directory Structure

```bash
# Create directories
mkdir -p agentasia-cloud/src/app/(backend)/api/workflows/feature-name/layer-1
mkdir -p agentasia-cloud/src/app/(backend)/api/workflows/feature-name/layer-2
mkdir -p agentasia-cloud/src/app/(backend)/api/workflows/feature-name/layer-3

# Create re-export files
echo "export { POST } from 'agentasia/src/app/(backend)/api/workflows/feature-name/layer-1/route';" > \
  agentasia-cloud/src/app/(backend)/api/workflows/feature-name/layer-1/route.ts

echo "export { POST } from 'agentasia/src/app/(backend)/api/workflows/feature-name/layer-2/route';" > \
  agentasia-cloud/src/app/(backend)/api/workflows/feature-name/layer-2/route.ts

echo "export { POST } from 'agentasia/src/app/(backend)/api/workflows/feature-name/layer-3/route';" > \
  agentasia-cloud/src/app/(backend)/api/workflows/feature-name/layer-3/route.ts
```

---

## TypeScript Path Mappings

The cloud project uses tsconfig path mappings to override agentasia code:

```json
// agentasia-cloud/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*", "./agentasia/src/*"]
    }
  }
}
```

**Resolution Order**:

1. `./src/*` (cloud code) - checked first
2. `./agentasia/src/*` (open-source) - fallback

This allows cloud to override specific modules while using agentasia defaults.

---

## Workflow Class Location

### Cloud-Only Workflows

Place workflow class in cloud:

```text
agentasia-cloud/apps/server/src/workflows/featureName/index.ts
```

### Shared Workflows

Place workflow class in agentasia, re-export in cloud if needed:

```text
agentasia/apps/server/src/workflows/featureName/index.ts
```

---

## Environment Variables

Both agentasia and cloud workflows require:

```bash
# Required for all workflows
APP_URL=https://your-app.com # Base URL for workflow endpoints
QSTASH_TOKEN=qstash_xxx      # QStash authentication token

# Optional (for custom QStash URL)
QSTASH_URL=https://custom-qstash.com # Custom QStash endpoint
```

**Cloud-Specific**:

```bash
# Cloud database (for monetization features)
CLOUD_DATABASE_URL=postgresql://...

# Cloud-specific services
REDIS_URL=redis://...
```

---

## Best Practices

### 1. Decide: Cloud or Open-Source?

**Implement in Lobehub if**:

- Feature is useful for all AgentAsia users
- No proprietary business logic
- Can be open-sourced

**Implement in Cloud if**:

- Premium/paid feature
- Uses cloud-specific services
- Contains proprietary algorithms

### 2. Re-export Pattern

✅ **Do**:

```typescript
// Simple re-export
export { POST } from 'agentasia/src/app/(backend)/api/workflows/feature/route';
```

❌ **Don't**:

```typescript
// Avoid circular imports with @/ path
export { POST } from '@/app/(backend)/api/workflows/feature/route'; // ❌
```

### 3. Keep Workflow Logic in Lobehub

For shared features:

- Implement core logic in `agentasia/` (open-source)
- Only override if cloud needs different behavior
- Use re-exports for cloud deployment

### 4. Directory Naming

Follow consistent naming across agentasia and cloud:

```text
# Both should use same structure
agentasia/src/app/(backend)/api/workflows/feature-name/
agentasia-cloud/src/app/(backend)/api/workflows/feature-name/
```

---

## Migration Guide

### Moving Workflow from Cloud to Lobehub

**Step 1**: Copy workflow to agentasia

```bash
cp -r agentasia-cloud/src/app/(backend)/api/workflows/feature \
      agentasia/src/app/(backend)/api/workflows/
```

**Step 2**: Remove cloud-specific dependencies

- Replace cloud services with generic interfaces
- Remove proprietary business logic
- Update imports to use agentasia paths

**Step 3**: Create re-exports in cloud

```typescript
// agentasia-cloud/src/app/(backend)/api/workflows/feature/*/route.ts
export { POST } from 'agentasia/src/app/(backend)/api/workflows/feature/*/route';
```

**Step 4**: Move workflow class to agentasia

```bash
mv agentasia-cloud/apps/server/src/workflows/feature \
  agentasia/apps/server/src/workflows/
```

**Step 5**: Update cloud imports

```typescript
// Change from
import { Workflow } from '@/server/workflows/feature';

// To
import { Workflow } from 'agentasia/apps/server/src/workflows/feature';
```

---

## Examples

### Cloud-Only Workflow: welcome-placeholder

**Location**: `agentasia-cloud/src/app/(backend)/api/workflows/welcome-placeholder/`

**Why Cloud-Only**: Uses proprietary AI generation service and Redis caching

**Structure**:

```text
agentasia-cloud/
├── src/app/(backend)/api/workflows/welcome-placeholder/
│   ├── process-users/route.ts
│   ├── paginate-users/route.ts
│   └── generate-user/route.ts
└── apps/server/src/workflows/welcomePlaceholder/
    └── index.ts
```

### Re-exported Workflow: agent-eval-run

**Location**:

- Implementation: `agentasia/src/app/(backend)/api/workflows/agent-eval-run/`
- Re-export: `agentasia-cloud/src/app/(backend)/api/workflows/agent-eval-run/`

**Why Re-export**: Core feature available in open-source, also used by cloud

**Cloud Re-export Files**:

```typescript
// agentasia-cloud/src/app/(backend)/api/workflows/agent-eval-run/run-benchmark/route.ts
export { POST } from 'agentasia/src/app/(backend)/api/workflows/agent-eval-run/run-benchmark/route';

// agentasia-cloud/src/app/(backend)/api/workflows/agent-eval-run/paginate-test-cases/route.ts
export { POST } from 'agentasia/src/app/(backend)/api/workflows/agent-eval-run/paginate-test-cases/route';

// ... (all layers)
```

---

## Troubleshooting

### Circular Import Error

**Error**: `Circular definition of import alias 'POST'`

**Cause**: Using `@/` path in re-export within cloud codebase

**Solution**: Use `agentasia/src/` path instead

```typescript
// ❌ Wrong
export { POST } from '@/app/(backend)/api/workflows/feature/route';

// ✅ Correct
export { POST } from 'agentasia/src/app/(backend)/api/workflows/feature/route';
```

### Workflow Not Found (404)

**Cause**: Missing re-export in cloud

**Solution**: Create re-export files for all workflow layers

```bash
# Check if re-export exists
ls agentasia-cloud/src/app/\(backend\)/api/workflows/feature-name/

# If missing, create re-exports
mkdir -p agentasia-cloud/src/app/\(backend\)/api/workflows/feature-name/layer
echo "export { POST } from 'agentasia/src/app/(backend)/api/workflows/feature-name/layer/route';" > agentasia-cloud/src/app/\(backend\)/api/workflows/feature-name/layer/route.ts
```

### Type Errors After Moving to Lobehub

**Cause**: Cloud-specific types or services used in agentasia code

**Solution**:

1. Extract cloud-specific logic to cloud-only wrapper
2. Use dependency injection for services
3. Define generic interfaces in agentasia

---

## Related Documentation

- [SKILL.md](../SKILL.md) - Standard workflow patterns
