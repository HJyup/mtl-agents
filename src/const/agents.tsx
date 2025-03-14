type Agent = {
  name: string;
  prefix: AgentPrefix;
  class: string;
};

export type AgentPrefix = "gm" | "cl" | "un" | "fn" | "th" | "nt";

export const AGENTS: Agent[] = [
  {
    name: "Google Mail",
    prefix: "gm",
    class: "bg-gradient-to-r from-red-500 to-yellow-500"
  },
  {
    name: "Google Calendar",
    prefix: "cl",
    class: "bg-gradient-to-r from-blue-500 to-green-500"
  },
  {
    name: "University Agent",
    prefix: "un",
    class: "bg-gradient-to-r from-purple-500 to-pink-500"
  },
  {
    name: "Things",
    prefix: "th",
    class: "bg-gradient-to-r from-blue-500 to-green-500"
  },
  {
    name: "Notion",
    prefix: "nt",
    class: "bg-gradient-to-r from-zinc-500 to-white"
  }
];

export const AGENT_CLASSES = {
  gm:
    "relative before:absolute before:inset-0 before:rounded-sm before:p-[2px] before:bg-gradient-to-r before:from-red-500 before:via-blue-500 before:via-yellow-500 before:to-green-500 before:blur-sm before:-z-10",
  cl:
    "relative before:absolute before:inset-0 before:rounded-sm before:p-[2px] before:bg-gradient-to-r before:from-blue-500 before:via-yellow-500 before:to-green-500 before:blur-sm before:-z-10",
  un:
    "relative before:absolute before:inset-0 before:rounded-sm before:p-[2px] before:bg-gradient-to-r before:from-purple-500 before:via-pink-500 before:to-red-500 before:blur-sm before:-z-10",
  th:
    "relative before:absolute before:inset-0 before:rounded-sm before:p-[2px] before:bg-gradient-to-r before:from-blue-500 before:via-sky-500 before:to-white before:blur-sm before:-z-10",
  nt:
    "relative before:absolute before:inset-0 before:rounded-sm before:p-[2px] before:bg-gradient-to-r before:from-zinc-500 before:to-white before:blur-sm before:-z-10"
};

export const PREFIX_TO_NAME: Record<
  AgentPrefix,
  string
> = AGENTS.reduce((acc, agent) => {
  acc[agent.prefix] = agent.name;
  return acc;
}, {} as Record<AgentPrefix, string>);
