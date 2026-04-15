import fs from "fs/promises";

const ENDPOINT = "https://gtrend.yapie.me/repositories?since=daily";

async function fetchTrending() {
  const res = await fetch(ENDPOINT);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const items = (Array.isArray(data) ? data : []).map((r) => ({
    id: r.author && r.name ? `${r.author}/${r.name}` : null,
    source: "github_trending",
    source_url: `https://github.com/trending?since=daily`,
    name: r.name || null,
    description: r.description || null,
    github_url: r.author && r.name ? `https://github.com/${r.author}/${r.name}` : null,
    stargazers_count: r.stars || r.star || 0,
    language: r.language || null,
    discovered_at: new Date().toISOString(),
  })).filter((i) => i.id && i.github_url);

  await fs.writeFile("trending_raw.json", JSON.stringify(items, null, 2));
  console.log("Fetched", items.length, "trending repos.");
}

fetchTrending().catch(console.error);
