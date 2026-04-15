import type { Software } from "../types";

const cardShadow = "rgba(0,0,0,0.04) 0px 4px 18px, rgba(0,0,0,0.027) 0px 2.025px 7.84688px, rgba(0,0,0,0.02) 0px 0.8px 2.925px, rgba(0,0,0,0.01) 0px 0.175px 1.04062px";

const deployLinks: Record<string, string> = {
  vercel: "https://vercel.com/new",
  railway: "https://railway.app/template",
  render: "https://render.com",
  flyio: "https://fly.io/launch",
  cloudflare: "https://developers.cloudflare.com/pages/get-started/direct-upload",
};

export function SoftwareCard({ item }: { item: Software }) {
  const stars = item.stargazers_count ?? 0;
  const platforms = item.platforms || [];
  const tags = item.tags || [];
  const deploys = item.deploy_buttons || [];
  const alt = item.proprietary_alternatives;

  return (
    <article
      className="bg-white rounded-[12px] border border-[rgba(0,0,0,0.1)] p-5 flex flex-col gap-2 hover:shadow-lg transition-shadow"
      style={{ boxShadow: cardShadow }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[16px] font-bold leading-tight text-[rgba(0,0,0,0.95)]">
          <a href={item.website_url || item.source_code_url || "#"} target="_blank" rel="noreferrer">
            {item.name}
          </a>
        </h3>
        <span className="text-[13px] font-medium text-[#615d59] whitespace-nowrap">⭐ {stars.toLocaleString()}</span>
      </div>

      <p className="text-[15px] text-[#615d59] leading-[1.5] line-clamp-2">{item.description || "No description."}</p>

      {alt && (
        <p className="text-[13px] text-[#a39e98]">
          Alternative to <span className="font-medium text-[#615d59]">{alt}</span>
        </p>
      )}

      <div className="flex flex-wrap gap-1.5 mt-1">
        {tags.slice(0, 3).map((t) => (
          <span
            key={t}
            className="text-[12px] font-semibold tracking-[0.125px] px-2.5 py-1 rounded-[9999px] bg-[#f2f9ff] text-[#097fe8]"
          >
            {t}
          </span>
        ))}
        {tags.length > 3 && (
          <span className="text-[12px] font-semibold px-2.5 py-1 text-[#a39e98]">+{tags.length - 3}</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-[13px] text-[#a39e98] mt-1">
        {platforms.slice(0, 4).map((p) => (
          <span key={p}>{p}</span>
        ))}
      </div>

      {deploys.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {deploys.map((d) => (
            <a
              key={d}
              href={deployLinks[d] || "#"}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-semibold px-2.5 py-1 rounded-[4px] bg-[rgba(0,0,0,0.05)] text-[rgba(0,0,0,0.95)] hover:bg-[rgba(0,0,0,0.08)] active:scale-[0.98] transition-transform"
            >
              Deploy to {d}
            </a>
          ))}
        </div>
      )}

      <div className="flex gap-3 text-[13px] mt-2 pt-3 border-t border-[rgba(0,0,0,0.06)]">
        {item.source_code_url && (
          <a href={item.source_code_url} target="_blank" rel="noreferrer" className="hover:underline">
            Source
          </a>
        )}
        {item.demo_url && (
          <a href={item.demo_url} target="_blank" rel="noreferrer" className="hover:underline">
            Demo
          </a>
        )}
        {item.current_release_tag && (
          <span className="text-[#a39e98]">{item.current_release_tag}</span>
        )}
      </div>
    </article>
  );
}
