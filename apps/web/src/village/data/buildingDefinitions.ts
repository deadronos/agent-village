import type { BuildingDefinition } from "@agent-village/shared";

export const buildingDefinitions: BuildingDefinition[] = [
  {
    id: "command-center",
    name: "Command Center",
    kind: "orchestrator",
    description: "Coordinator and orchestration activity",
    x: 5,
    y: 4,
    width: 2,
    depth: 2,
    height: 72,
    color: "#6d2f2c",
    roofColor: "#b93732"
  },
  {
    id: "chat-hall",
    name: "Chat Hall",
    kind: "chat",
    description: "LLM conversation sessions",
    x: 8,
    y: 2,
    width: 2,
    depth: 2,
    height: 62,
    color: "#274a7c",
    roofColor: "#245bd3"
  },
  {
    id: "code-forge",
    name: "Code Forge",
    kind: "coding",
    description: "Code generation and repository edits",
    x: 10,
    y: 5,
    width: 2,
    depth: 2,
    height: 66,
    color: "#4b3a2e",
    roofColor: "#222a35"
  },
  {
    id: "token-mine",
    name: "Token Mine",
    kind: "tool",
    description: "Token usage and request volume",
    x: 3,
    y: 2,
    width: 2,
    depth: 2,
    height: 52,
    color: "#5b4229",
    roofColor: "#7a4a22"
  },
  {
    id: "task-board",
    name: "Task Board",
    kind: "queue",
    description: "Queues, plans, and prioritization",
    x: 2,
    y: 6,
    width: 2,
    depth: 1,
    height: 36,
    color: "#6b4627",
    roofColor: "#c28b3c"
  },
  {
    id: "memory-archive",
    name: "Memory Archive",
    kind: "memory",
    description: "Embeddings, logs, and stored context",
    x: 8,
    y: 7,
    width: 2,
    depth: 2,
    height: 64,
    color: "#34444d",
    roofColor: "#6aa9b2"
  },
  {
    id: "research-lab",
    name: "Research Lab",
    kind: "research",
    description: "Browsing, retrieval, and experiments",
    x: 5,
    y: 7,
    width: 2,
    depth: 2,
    height: 58,
    color: "#4c3c68",
    roofColor: "#7a43d1"
  },
  {
    id: "alert-tower",
    name: "Alert Tower",
    kind: "custom",
    description: "Errors, blocked work, and source health",
    x: 11,
    y: 3,
    width: 1,
    depth: 1,
    height: 86,
    color: "#453942",
    roofColor: "#b63244"
  }
];

export const buildingById = Object.fromEntries(buildingDefinitions.map((building) => [building.id, building]));
