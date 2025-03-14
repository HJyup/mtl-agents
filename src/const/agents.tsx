export type AgentPrefix = "gm" | "cl" | "un" | "th" | "nt";

export interface Agent {
  name: string;
  prefix: AgentPrefix;
  description: string;
  class: string;
}

const AGENT_DATA: Record<AgentPrefix, Omit<Agent, "prefix">> = {
  gm: {
    name: "Google Mail",
    description: "Email management and communication",
    class: "agent-gm",
  },
  cl: {
    name: "Google Calendar",
    description: "Schedule management and events",
    class: "agent-cl",
  },
  un: {
    name: "University Agent",
    description: "Academic resource management",
    class: "agent-un",
  },
  th: {
    name: "Things",
    description: "Task management and productivity",
    class: "agent-th",
  },
  nt: {
    name: "Notion",
    description: "Note-taking and documentation",
    class: "agent-nt",
  },
};

const GRADIENT_CLASSES: Record<AgentPrefix, string> = {
  gm: "relative before:absolute before:inset-0 before:rounded-2xl before:p-[2px] before:bg-gradient-to-r before:from-red-500 before:via-blue-500 before:via-yellow-500 before:to-green-500 before:blur-sm before:-z-10",
  cl: "relative before:absolute before:inset-0 before:rounded-2xl before:p-[2px] before:bg-gradient-to-r before:from-blue-500 before:via-yellow-500 before:to-green-500 before:blur-sm before:-z-10",
  un: "relative before:absolute before:inset-0 before:rounded-2xl before:p-[2px] before:bg-gradient-to-r before:from-purple-500 before:via-pink-500 before:to-red-500 before:blur-sm before:-z-10",
  th: "relative before:absolute before:inset-0 before:rounded-2xl before:p-[2px] before:bg-gradient-to-r before:from-blue-500 before:via-sky-500 before:to-white before:blur-sm before:-z-10",
  nt: "relative before:absolute before:inset-0 before:rounded-2xl before:p-[2px] before:bg-gradient-to-r before:from-zinc-500 before:to-white before:blur-sm before:-z-10",
};

export const AGENTS = Object.entries(AGENT_DATA).map(([prefix, data]) => ({
  prefix: prefix as AgentPrefix,
  ...data,
}));
export const AGENT_CLASSES = GRADIENT_CLASSES;
export const PREFIX_TO_NAME = Object.fromEntries(
  Object.entries(AGENT_DATA).map(([prefix, data]) => [prefix, data.name]),
) as Record<AgentPrefix, string>;

export const STRING_TO_PREFIX = (str: string) => {
  const prefix = str.split(" ")[0];
  if (prefix !== undefined) {
    return prefix in AGENT_DATA ? (prefix as AgentPrefix) : null;
  }
  return null;
};
