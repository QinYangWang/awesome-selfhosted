import type { DiscoveredProject } from "../types";

const cardShadow = "rgba(0,0,0,0.04) 0px 4px 18px, rgba(0,0,0,0.027) 0px 2.025px 7.84688px, rgba(0,0,0,0.02) 0px 0.8px 2.925px, rgba(0,0,0,0.01) 0px 0.175px 1.04062px";

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
    <article
      className="bg-white rounded-[12px] border border-[rgba(0,0,0,0.1)] p-5 flex flex-col gap-2 hover:shadow-lg transition-shadow"
      style={{ boxShadow: cardShadow }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[16px] font-bold leading-tight text-[rgba(0,0,0,0.95)]">
          <a href={item.github_url || "#"} target="_blank" rel="noreferrer">
            {item.name}
          </a>
        </h3>
        <span className="text-[13px] font-medium text-[#615d59] whitespace-nowrap">⭐ {stars.toLocaleString()}</span>
      </div>
      <p className="text-[15px] text-[#615d59] leading-[1.5]">{item.description || "No description."}</p>
      {item.llm_category && (
        <p className="text-[13px] text-[#a39e98]">
          Category: <span className="font-medium text-[#615d59]">{item.llm_category}</span>
          {item.llm_has_docker ? " • Has Docker" : ""}
        </p>
      )}
      {item.llm_confidence !== null && (
        <p className="text-[13px] text-[#a39e98]">AI confidence: {Math.round(item.llm_confidence * 100)}%</p>
      )}
      {isAdmin && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={onApprove}
            className="text-[12px] font-semibold px-3 py-1.5 rounded-[4px] bg-[#0075de] text-white hover:bg-[#005bab] active:scale-[0.98] transition-transform"
          >
            Approve
          </button>
          <button
            onClick={onReject}
            className="text-[12px] font-semibold px-3 py-1.5 rounded-[4px] bg-[rgba(0,0,0,0.05)] text-[rgba(0,0,0,0.95)] hover:bg-[rgba(0,0,0,0.08)] active:scale-[0.98] transition-transform"
          >
            Reject
          </button>
        </div>
      )}
    </article>
  );
}
