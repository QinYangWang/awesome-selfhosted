import type { DiscoveredProject } from "../types";

export function DiscoveredCard({
  item,
  isAdmin,
  onApprove,
  onReject,
}: {
  item: DiscoveredProject;
  isAdmin?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  const stars = item.stargazers_count ?? 0;
  return (
    <article className="border border-neutral-200 dark:border-neutral-800 p-4 flex flex-col gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-tight">
          <a href={item.github_url || "#"} target="_blank" rel="noreferrer">
            {item.name}
          </a>
        </h3>
        <span className="text-xs text-neutral-500 whitespace-nowrap">⭐ {stars.toLocaleString()}</span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{item.description || "No description."}</p>
      {item.llm_category && (
        <p className="text-xs text-neutral-500">
          Category: <span className="font-medium text-neutral-700 dark:text-neutral-300">{item.llm_category}</span>
          {item.llm_has_docker ? " • Has Docker" : ""}
        </p>
      )}
      {item.llm_confidence !== null && (
        <p className="text-xs text-neutral-500">AI confidence: {Math.round(item.llm_confidence * 100)}%</p>
      )}
      {isAdmin && (
        <div className="flex gap-2 mt-1">
          <button onClick={onApprove} className="text-[10px] px-2 py-1 bg-black text-white dark:bg-white dark:text-black hover:opacity-80">
            Approve
          </button>
          <button onClick={onReject} className="text-[10px] px-2 py-1 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            Reject
          </button>
        </div>
      )}
    </article>
  );
}
