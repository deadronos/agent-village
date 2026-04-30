# Agent Village Product Spec

## Goal

Build a website where AI agents, sessions, and tool processes appear as live residents and building activity in an isometric pixel village. The dashboard must be useful without the metaphor: users can inspect live status, recent events, metrics, filters, and data-stream health.

## MVP Scope

- Vite + React + TypeScript frontend.
- Zustand for local dashboard state.
- PixiJS canvas for the isometric village.
- Mock live simulation in the web app.
- Node + Fastify backend with REST and WebSocket live feed.
- SQLite-backed local persistence using Node's built-in SQLite API when available.
- Shared Zod schemas and TypeScript types.
- Docs for architecture and asset generation prompts.

## Primary Screen

The primary screen is a dense dark dashboard inspired by the provided mockup:

- Top bar with brand, uptime, status counts, and view/action buttons.
- Left sidebar with searchable/filterable agents.
- Center PixiJS village with fixed buildings, tile grid, labels, activity badges, and visual state effects.
- Right inspector panel for selected agents or selected buildings.
- Bottom status bar with system status, stream state, activity level, and region/source.

## Agent Statuses

- `running`: green pulse, active progress, lit building markers.
- `idle`: blue marker, low activity.
- `waiting`: amber marker, delayed/queued state.
- `error`: red marker, alert outline and recent error surfacing.
- `offline`: gray marker, stale or unavailable source.

## Agent Kinds

- `orchestrator`
- `chat`
- `coding`
- `research`
- `memory`
- `queue`
- `tool`
- `custom`

Each kind maps to a default building. Agents can also explicitly provide a `buildingId`.

## Core Interactions

- Click a status chip to filter the agent list and highlight matching buildings.
- Search by agent name, task, source, or building.
- Click an agent to select it and pan/highlight its building.
- Hover an agent to pulse its building.
- Click a building to inspect grouped agents for that building.
- Recent events update as mock or backend events arrive.
- WebSocket connection state is visible and gracefully falls back to mock data if no backend is running.

## Backend API

- `GET /health`: health and uptime.
- `GET /agents`: current agent registry.
- `GET /events?agentId=...`: recent events.
- `POST /events`: validate, persist, upsert agent state, and broadcast.
- `GET /live`: WebSocket live feed.

## Acceptance Criteria

- The app opens to the dashboard, not a marketing page.
- Mock agents render in the sidebar and village.
- Status chips show live counts and filter the UI.
- Selecting agents/buildings updates the right panel.
- The village resizes with the viewport and renders nonblank isometric tiles/buildings.
- Mock events update progress, status, metrics, and recent event stream.
- Backend accepts posted events and broadcasts state updates.
- Docs include ready-to-drop asset prompts and target filenames.
