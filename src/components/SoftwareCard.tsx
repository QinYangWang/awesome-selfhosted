import type { Software } from "../types";

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
    <article className="border border-neutral-200 dark:border-neutral-800 p-4 flex flex-col gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-tight">
          <a href={item.website_url || item.source_code_url || "#"} target="_blank" rel="noreferrer">
            {item.name}
          </a>
        </h3>
        <span className="text-xs text-neutral-500 whitespace-nowrap">⭐ {stars.toLocaleString()}</span>
      </div>

      <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">{item.description || "No description."}</p>

      {alt && (
        <p className="text-xs text-neutral-500">
          Alternative to <span className="font-medium text-neutral-700 dark:text-neutral-300">{alt}</span>
        </p>
      )}

      <div className="flex flex-wrap gap-1 mt-1">
        {tags.slice(0, 3).map((t) => (
          <span key={t} className="text-[10px] px-1.5 py-0.5 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
            {t}
          </span>
        ))}
        {tags.length > 3 && (
          <span className="text-[10px] px-1.5 py-0.5 text-neutral-400">+{tags.length - 3}</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-neutral-500 mt-1">
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
              className="text-[10px] px-2 py-1 bg-black text-white dark:bg-white dark:text-black hover:opacity-80"
            >
              Deploy to {d}
            </a>
          ))}
        </div>
      )}

      <div className="flex gap-3 text-xs mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
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
          <span className="text-neutral-400">{item.current_release_tag}</span>
        )}
      </div>
    </article>
  );
}
