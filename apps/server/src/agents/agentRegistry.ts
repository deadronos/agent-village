import {
  applyAgentEvent,
  createAgentFromEvent,
  deriveAgentCounts,
  type Agent,
  type AgentCounts,
  type AgentEvent
} from "@agent-village/shared";

export type AgentRegistry = {
  upsertFromEvent(event: AgentEvent): Agent;
  listAgents(): Agent[];
  getAgent(id: string): Agent | undefined;
  getCounts(): AgentCounts;
};

export function createAgentRegistry(seedAgents: Agent[] = []): AgentRegistry {
  const agents = new Map(seedAgents.map((agent) => [agent.id, agent]));

  return {
    upsertFromEvent(event) {
      const existing = agents.get(event.agentId);
      const next = existing ? applyAgentEvent(existing, event) : createAgentFromEvent(event);
      agents.set(next.id, next);
      return next;
    },
    listAgents() {
      return [...agents.values()].sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));
    },
    getAgent(id) {
      return agents.get(id);
    },
    getCounts() {
      return deriveAgentCounts([...agents.values()]);
    }
  };
}
