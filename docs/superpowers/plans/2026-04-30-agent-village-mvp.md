# Agent Village MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local full-stack Agent Village observability dashboard with mock live data, PixiJS isometric rendering, backend event ingestion, and product documentation.

**Architecture:** A shared package defines schemas, types, and derived visual state. The server validates and persists events, upserts agent state, and broadcasts snapshots. The web app renders dashboard chrome in React and village state in PixiJS while supporting mock fallback when the backend is unavailable.

**Tech Stack:** Vite, React, TypeScript, Zustand, PixiJS, Fastify, WebSocket, Zod, SQLite, Vitest.

---

### Task 1: Documentation And Workspace Shell

**Files:**
- Create: `idea.md`
- Create: `docs/spec.md`
- Create: `docs/architecture.md`
- Create: `docs/assets-prompts.md`
- Create: `package.json`
- Create: `tsconfig.base.json`

- [x] Capture the product idea, spec, architecture, and asset prompts.
- [x] Add workspace package scripts for install, dev, test, typecheck, and build.

### Task 2: Shared Model

**Files:**
- Create: `packages/shared/src/schemas.ts`
- Create: `packages/shared/src/types.ts`
- Create: `packages/shared/src/derived.ts`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/test/derived.test.ts`

- [x] Write tests for agent counts, filtering, building status rollups, and event-derived updates.
- [x] Implement schemas and selectors.
- [x] Run `npm test --workspace @agent-village/shared`.

### Task 3: Backend

**Files:**
- Create: `apps/server/src/index.ts`
- Create: `apps/server/src/db/client.ts`
- Create: `apps/server/src/agents/agentRegistry.ts`
- Create: `apps/server/src/events/ingestEvent.ts`
- Create: `apps/server/src/events/eventRouter.ts`
- Create: `apps/server/src/live/broadcaster.ts`
- Create: `apps/server/src/adapters/mockAdapter.ts`
- Create: `apps/server/test/ingest.test.ts`

- [x] Write ingest tests for event validation, agent upsert, and recent event retrieval.
- [x] Implement SQLite persistence, REST routes, and WebSocket broadcaster.
- [x] Run `npm test --workspace @agent-village/server`.

### Task 4: Web Dashboard

**Files:**
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/App.tsx`
- Create: dashboard components under `apps/web/src/components/`
- Create: Pixi renderer under `apps/web/src/village/`
- Create: store/api/mock modules under `apps/web/src/`

- [x] Implement top bar, agent sidebar, inspector, status bar, and live event panel.
- [x] Implement PixiJS isometric village with building selection and status effects.
- [x] Wire Zustand selectors, mock simulation, and backend live stream fallback.

### Task 5: Verification

**Files:**
- Modify: as needed based on test/build/browser findings.

- [x] Run `npm install`.
- [x] Run `npm test`.
- [x] Run `npm run typecheck`.
- [x] Run `npm run build`.
- [x] Start the dev server.
- [x] Verify the dashboard visually in a browser and capture the tested URL.
