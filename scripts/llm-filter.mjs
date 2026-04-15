import fs from "fs/promises";

const KIMI_API_KEY = process.env.KIMI_API_KEY || "";
const KIMI_BASE_URL = process.env.KIMI_BASE_URL || "https://api.moonshot.cn/v1";

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchRepoMeta(owner, repo) {
  try {
    const [infoRes, readmeRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}`),
      fetch(`https://api.github.com/repos/${owner}/${repo}/readme`),
    ]);
    const info = infoRes.ok ? await infoRes.json() : {};
    let readmeText = "";
    if (readmeRes.ok) {
      const readmeData = await readmeRes.json();
      if (readmeData.content) {
        readmeText = Buffer.from(readmeData.content, "base64").toString("utf8").slice(0, 800);
      }
    }
    return {
      description: info.description || "",
      topics: info.topics || [],
      language: info.language || "",
      readme: readmeText,
    };
  } catch (e) {
    return { description: "", topics: [], language: "", readme: "" };
  }
}

async function askKimi(name, description, topics, language, readme) {
  if (!KIMI_API_KEY) {
    console.warn("No KIMI_API_KEY, skipping LLM filter.");
    return { is_selfhostable: false, confidence: 0, category: "", has_docker: false, reason: "No API key" };
  }
  const prompt = `You are an expert in identifying self-hostable web services.

Project: ${name}
Description: ${description}
Topics: ${topics.join(", ")}
Language: ${language}
README excerpt:
${readme.slice(0, 600)}

Is this a complete end-user web application/service that can be self-hosted (not a library, framework, CLI tool, or SDK)?
Reply in strict JSON:
{
  "is_selfhostable": true|false,
  "confidence": 0.0-1.0,
  "category": "best category name",
  "has_docker": true|false,
  "reason": "short reason"
}`;

  const res = await fetch(`${KIMI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${KIMI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "kimi-k2-5-coder",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    }),
  });
  if (!res.ok) throw new Error(`Kimi API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in Kimi response");
  try {
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    throw new Error("Failed to parse Kimi JSON: " + content);
  }
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function toSqlValue(v) {
  if (v === null || v === undefined) return "NULL";
  return "'" + String(v).replace(/'/g, "''") + "'";
}

async function main() {
  const raw = await fs.readFile("trending_raw.json", "utf8").catch(() => "[]");
  const items = JSON.parse(raw);
  const approved = [];

  for (const item of items) {
    const [owner, repo] = item.id.split("/");
    const meta = await fetchRepoMeta(owner, repo);
    const desc = item.description || meta.description || "";
    const result = await askKimi(item.name, desc, meta.topics, meta.language, meta.readme);
    console.log(item.id, "->", result.is_selfhostable, result.confidence, result.category);
    if (result.is_selfhostable && result.confidence >= 0.6) {
      approved.push({
        ...item,
        llm_confidence: result.confidence,
        llm_category: result.category,
        llm_has_docker: result.has_docker ? 1 : 0,
        description: desc,
      });
    }
    await sleep(500);
  }

  let sql = "";
  for (const a of approved) {
    const id = slugify(a.name);
    sql += `INSERT OR IGNORE INTO discovered_projects (id, source, source_url, name, description, github_url, stargazers_count, discovered_at, llm_confidence, llm_category, llm_has_docker, status) VALUES (${toSqlValue(id)}, ${toSqlValue(a.source)}, ${toSqlValue(a.source_url)}, ${toSqlValue(a.name)}, ${toSqlValue(a.description)}, ${toSqlValue(a.github_url)}, ${toSqlValue(a.stargazers_count)}, ${toSqlValue(a.discovered_at.split("T")[0])}, ${toSqlValue(a.llm_confidence)}, ${toSqlValue(a.llm_category)}, ${a.llm_has_docker}, 'pending');\n`;
  }

  await fs.writeFile("discovered.sql", sql);
  console.log("Generated discovered.sql with", approved.length, "items.");
}

main().catch(console.error);
