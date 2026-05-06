import type { AgentKind, EventLevel, EventType, IngestEvent } from "@agent-village/shared";

const mockAgents: Array<{
  id: string;
  name: string;
  kind: AgentKind;
  buildingId: string;
  tasks: string[];
}> = [
  { id: "ag-0001", name: "Command Center", kind: "orchestrator", buildingId: "command-center", tasks: ["Orchestrating workflow", "Assigning tool calls"] },
  { id: "ag-0002", name: "Chat Hall", kind: "chat", buildingId: "chat-hall", tasks: ["Handling conversations", "Summarizing context"] },
  { id: "ag-0003", name: "Code Forge", kind: "coding", buildingId: "code-forge", tasks: ["Generating code", "Reviewing patch"] },
  { id: "ag-0004", name: "Token Mine", kind: "tool", buildingId: "token-mine", tasks: ["Measuring token flow", "Awaiting requests"] },
  { id: "ag-0005", name: "Task Board", kind: "queue", buildingId: "task-board", tasks: ["Prioritizing tasks", "Waiting on dependency"] },
  { id: "ag-0006", name: "Memory Archive", kind: "memory", buildingId: "memory-archive", tasks: ["Indexing memories", "Compacting transcript"] },
  { id: "ag-0007", name: "Research Lab", kind: "research", buildingId: "research-lab", tasks: ["Knowledge synthesis", "Browsing sources"] }
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function createMockIngestEvent(sequence: number): IngestEvent {
  const agent = mockAgents[sequence % mockAgents.length]!;
  const rng = seededRandom(sequence);

  const level: EventLevel =
    Math.floor(sequence / 17) % 7 === 0 ? "error" :
    Math.floor(sequence / 7) % 5 === 0 ? "warning" :
    Math.floor(sequence / 5) % 4 === 0 ? "success" : "info";

  const typeMap: Record<EventLevel, EventType[]> = {
    error: ["error"],
    warning: ["task_progress", "tool_call"],
    success: ["task_completed", "task_progress"],
    info: ["task_progress", "token_usage", "tool_call", "message"]
  };
  const available = typeMap[level]!;
  const type = available[Math.floor(rng() * available.length)!] as EventType;

  const status = level === "error" ? "error" :
    Math.floor(sequence / 11) % 6 === 0 ? "waiting" :
    type === "task_completed" ? "idle" : "running";

  const task = agent.tasks[sequence % agent.tasks.length]!;
  const progress = type === "task_completed" ? 100 : Math.floor(((sequence * 13) % 97) + 2);

  return {
    agentId: agent.id,
    source: "mock-adapter",
    type,
    level,
    message: level === "error" ? `${agent.name} reported a blocked action` : task,
    metadata: {
      name: agent.name,
      kind: agent.kind,
      buildingId: agent.buildingId,
      status,
      currentTask: task,
      progress,
      tokensPerMinute: Math.floor(rng() * 14000) + 400,
      latencyMs: Math.floor(rng() * 1300) + 40,
      queueDepth: Math.floor(rng() * 8),
      successRate: level === "error" ? 72 : 99.5 - (rng() * 5)
    }
  };
}
