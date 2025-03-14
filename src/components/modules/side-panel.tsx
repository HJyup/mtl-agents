import { AGENTS } from "@/const/agents";

const SidePanel = () => (
  <aside className="h-screen w-1/6 border-zinc-100 p-6 pt-52 dark:border-zinc-800/40">
    <div className="mb-6">
      <h3 className="mb-3 text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-500">
        Available Agents
      </h3>
      {AGENTS.map((agent) => (
        <p
          key={agent.prefix}
          className="hover:text-primary w-full rounded-md px-1 py-2 text-left text-sm font-medium text-zinc-700 transition-colors dark:text-zinc-300"
        >
          {agent.name}{" "}
          <span className="text-xs text-zinc-500 dark:text-zinc-600">
            {agent.prefix}
          </span>
        </p>
      ))}
    </div>
  </aside>
);

export default SidePanel;
