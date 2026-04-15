import { parse } from "yaml";
import fs from "fs/promises";
import path from "path";
import { execSync } from "child_process";

const REPO_URL = "https://github.com/awesome-selfhosted/awesome-selfhosted-data.git";
const TMP_DIR = "/tmp/awesome-selfhosted-data";
const DEPLOY_MAP = {
  umami: ["vercel", "railway", "render"],
  outline: ["railway", "render"],
  nocodb: ["railway", "render"],
  "cal.com": ["vercel"],
  affine: ["vercel"],
  n8n: ["railway"],
  activepieces: ["railway"],
  budibase: ["railway"],
  ghost: ["railway", "render"],
  plausible: ["render"],
};

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function extractAlternative(desc) {
  if (!desc) return null;
  const m = desc.match(/\(alternative to ([^)]+)\)/i);
  return m ? m[1] : null;
}

async function cloneOrPull() {
  try {
    await fs.access(path.join(TMP_DIR, ".git"));
    console.log("Pulling latest...");
    execSync("git pull", { cwd: TMP_DIR, stdio: "inherit" });
  } catch {
    console.log("Cloning repo...");
    execSync(`git clone --depth 1 ${REPO_URL} ${TMP_DIR}`, { stdio: "inherit" });
  }
}

async function readYamls(dir) {
  const files = await fs.readdir(dir);
  const yamls = [];
  for (const f of files) {
    if (f.endsWith(".yml")) {
      const content = await fs.readFile(path.join(dir, f), "utf8");
      try {
        const data = parse(content);
        yamls.push(data);
      } catch (e) {
        console.warn("Failed to parse", f);
      }
    }
  }
  return yamls;
}

async function readTags(dir) {
  const files = await fs.readdir(dir);
  const tags = [];
  for (const f of files) {
    if (f.endsWith(".yml")) {
      const content = await fs.readFile(path.join(dir, f), "utf8");
      try {
        const data = parse(content);
        tags.push(data);
      } catch (e) {
        console.warn("Failed to parse tag", f);
      }
    }
  }
  return tags;
}

function toSqlValue(v) {
  if (v === null || v === undefined) return "NULL";
  return "'" + String(v).replace(/'/g, "''") + "'";
}

async function main() {
  await cloneOrPull();
  const softwareDir = path.join(TMP_DIR, "software");
  const tagsDir = path.join(TMP_DIR, "tags");

  const items = await readYamls(softwareDir);
  const tags = await readTags(tagsDir);

  let sql = "DELETE FROM software;\n";
  sql += "DELETE FROM tags;\n";

  for (const item of items) {
    const id = slugify(item.name);
    const alt = extractAlternative(item.description);
    const deploy = DEPLOY_MAP[id] || [];
    sql += `INSERT INTO software VALUES (${toSqlValue(id)}, ${toSqlValue(item.name)}, ${toSqlValue(item.description || null)}, ${toSqlValue(item.website_url || null)}, ${toSqlValue(item.source_code_url || null)}, ${toSqlValue(item.demo_url || null)}, ${toSqlValue(item.stargazers_count || null)}, ${toSqlValue(item.updated_at || null)}, ${item.archived ? 1 : 0}, ${toSqlValue(item.current_release?.tag || null)}, ${toSqlValue(item.current_release?.published_at || null)}, ${toSqlValue(JSON.stringify(item.platforms || []))}, ${toSqlValue(JSON.stringify(item.tags || []))}, ${toSqlValue(JSON.stringify(item.licenses || []))}, ${toSqlValue(alt)}, ${toSqlValue(JSON.stringify(deploy))}, ${toSqlValue(JSON.stringify(item.commit_history || {}))});\n`;
  }

  for (const tag of tags) {
    sql += `INSERT INTO tags VALUES (${toSqlValue(tag.name)}, ${toSqlValue(tag.description || null)}, ${toSqlValue(JSON.stringify(tag.related_tags || []))});\n`;
  }

  sql += "\n";

  await fs.writeFile("sync.sql", sql);
  console.log("Generated sync.sql with", items.length, "items and", tags.length, "tags.");
  console.log("Run: wrangler d1 execute awesome-selfhosted-db --file=./sync.sql --remote");
}

main().catch(console.error);
