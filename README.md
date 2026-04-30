# Agent Village

Real-time AI agent observability dashboard wrapped in an isometric pixel-village metaphor.

## Run

```sh
npm install
npm run dev
```

Web: `http://127.0.0.1:5173/`

API: `http://127.0.0.1:4317/health`

## Verify

```sh
npm test
npm run typecheck
npm run build
```

## Runtime Data

The server writes local SQLite data to `.data/agent-village.sqlite` by default. Runtime data, build output, and dependency folders are intentionally ignored by git.
