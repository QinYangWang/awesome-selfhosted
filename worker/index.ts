export interface Env {
  DB: D1Database;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (pathname === "/api/tags") {
      const { results } = await env.DB.prepare("SELECT * FROM tags ORDER BY name").all();
      return json(results || [], corsHeaders);
    }

    if (pathname === "/api/software") {
      const tag = url.searchParams.get("tag");
      const search = url.searchParams.get("search") || "";
      const sort = url.searchParams.get("sort") || "stargazers_desc";
      const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
      const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "24", 10)));
      const offset = (page - 1) * limit;

      let where = "1=1";
      const params: any[] = [];

      if (tag) {
        where += " AND tags_json LIKE ?";
        params.push(`%"${tag}"%`);
      }
      if (search.trim()) {
        where += " AND (name LIKE ? OR description LIKE ?)";
        const q = `%${search.trim()}%`;
        params.push(q, q);
      }

      let orderBy = "stargazers_count DESC";
      if (sort === "name_asc") orderBy = "name ASC";
      else if (sort === "updated_desc") orderBy = "updated_at DESC";

      const countStmt = await env.DB.prepare(`SELECT COUNT(*) as total FROM software WHERE ${where}`).bind(...params).first();
      const total = (countStmt?.total as number) || 0;

      const listStmt = env.DB.prepare(`SELECT * FROM software WHERE ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`).bind(...params, limit, offset);
      const { results } = await listStmt.all();

      return json({ total, page, limit, items: (results || []).map(parseRow) }, corsHeaders);
    }

    if (pathname.startsWith("/api/software/")) {
      const id = pathname.replace("/api/software/", "");
      const row = await env.DB.prepare("SELECT * FROM software WHERE id = ?").bind(id).first();
      if (!row) return json({ error: "Not found" }, corsHeaders, 404);
      return json(parseRow(row), corsHeaders);
    }

    // Static assets fallback
    return env.ASSETS.fetch(request);
  },
};

function parseRow(row: Record<string, any>) {
  return {
    ...row,
    platforms: safeJson(row.platforms_json),
    tags: safeJson(row.tags_json),
    licenses: safeJson(row.licenses_json),
    deploy_buttons: safeJson(row.deploy_buttons_json),
    commit_history: safeJson(row.commit_history_json),
  };
}

function safeJson(v: unknown) {
  if (!v) return null;
  try {
    return JSON.parse(String(v));
  } catch {
    return v;
  }
}

function json(data: unknown, headers: Record<string, string>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}
