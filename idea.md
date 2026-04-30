# Agent Village

Agent Village is a real-time AI agent observability dashboard wrapped in an isometric pixel-village metaphor. It is not a pure game: the village is the visual layer, while the product underneath is a practical monitoring surface for sessions, tool calls, queues, memory activity, token volume, failures, and live task progress.

Every AI agent, session, or tool process becomes a visible resident or building activity:

- Command Center: coordinator and orchestrator activity.
- Chat Hall: LLM conversations and session traffic.
- Code Forge: code generation, edits, and repo work.
- Token Mine: token usage, request volume, and throughput.
- Task Board: queues, planning, and todo flow.
- Memory Archive: embeddings, logs, RAG, and stored context.
- Research Lab: browsing, retrieval, experiments, and synthesis.
- Alert Tower: errors, blocked work, and failed tasks.

The first useful version is a local website that shows 6-8 village buildings, streams mock live agents, lets users select agents or buildings, and visually reflects running, idle, waiting, error, and offline states. The next version connects the same dashboard to a backend receiving real events from one local adapter source.

The key product rule: tiles and sprites are never the source of truth. Agent state and events are the source of truth. The village only visualizes them.
