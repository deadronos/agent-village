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

export function createMockIngestEvent(sequence: number): IngestEvent {
  const agent = mockAgents[sequence % mockAgents.length]!;
  const level: EventLevel = sequence % 17 === 0 ? "error" : sequence % 7 === 0 ? "warning" : sequence % 5 === 0 ? "success" : "info";
  const type: EventType =
    level === "error"
      ? "error"
      : sequence % 5 === 0
        ? "task_completed"
        : sequence % 3 === 0
          ? "token_usage"
          : "task_progress";
  const status = level === "error" ? "error" : sequence % 11 === 0 ? "waiting" : type === "task_completed" ? "idle" : "running";
  const task = agent.tasks[sequence % agent.tasks.length]!;

  return {
    agentId: agent.id,
    source: "mock-adapter",
    type,
    level,
    message: type === "error" ? `${agent.name} reported a blocked action` : task,
    metadata: {
      name: agent.name,
      kind: agent.kind,
      buildingId: agent.buildingId,
      status,
      currentTask: task,
      progress: type === "task_completed" ? 100 : (sequence * 13) % 99,
      tokensPerMinute: 400 + ((sequence * 997) % 14000),
      latencyMs: 40 + ((sequence * 53) % 1300),
      queueDepth: sequence % 8,
      successRate: Math.max(72, 99.5 - (level === "error" ? 12 : sequence % 6))
    }
  };
}
