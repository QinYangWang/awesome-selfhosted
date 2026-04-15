import { SignJWT, jwtVerify } from "jose";

export interface Env {
  DB: D1Database;
  ADMIN_PASSWORD_STORE: SecretsStoreSecret;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyAdmin(request: Request, env: Env) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.replace("Bearer ", "");
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode("awesome-selfhosted-secret-key-2026");
    const { payload } = await jwtVerify(token, secret);
    if (payload.role === "admin") return payload;
    return null;
  } catch {
    return null;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Admin login
    if (pathname === "/api/admin/login" && request.method === "POST") {
      const body = await request.json<{ username: string; password: string }>().catch(() => ({} as any));
      if (body.username !== "admin") {
        return json({ error: "Invalid credentials" }, corsHeaders, 401);
      }
      const adminPassword = await env.ADMIN_PASSWORD_STORE.get();
      if (!adminPassword) {
        return json({ error: "Server misconfiguration" }, corsHeaders, 500);
      }
      const inputHash = await hashPassword(body.password);
      const expectedHash = await hashPassword(adminPassword);
      if (inputHash !== expectedHash) {
        return json({ error: "Invalid credentials" }, corsHeaders, 401);
      }
      const secret = new TextEncoder().encode("awesome-selfhosted-secret-key-2026");
      const token = await new SignJWT({ role: "admin", sub: "admin" })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .sign(secret);
      return json({ token }, corsHeaders);
    }

    // Admin check
    const admin = await verifyAdmin(request, env);

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

    // Discovered projects API
    if (pathname === "/api/discovered") {
      const status = url.searchParams.get("status") || "approved";
      const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
      const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "24", 10)));
      const offset = (page - 1) * limit;

      if (!admin && status !== "approved") {
        return json({ error: "Forbidden" }, corsHeaders, 403);
      }

      const where = "status = ?";
      const params = [status];

      const countStmt = await env.DB.prepare(`SELECT COUNT(*) as total FROM discovered_projects WHERE ${where}`).bind(...params).first();
      const total = (countStmt?.total as number) || 0;

      const listStmt = env.DB.prepare(`SELECT * FROM discovered_projects WHERE ${where} ORDER BY discovered_at DESC LIMIT ? OFFSET ?`).bind(...params, limit, offset);
      const { results } = await listStmt.all();

      return json({ total, page, limit, items: results || [], isAdmin: !!admin }, corsHeaders);
    }

    if (pathname.match(/^\/api\/discovered\/[^/]+\/(approve|reject)$/)) {
      if (!admin) return json({ error: "Forbidden" }, corsHeaders, 403);
      const match = pathname.match(/^\/api\/discovered\/([^/]+)\/(approve|reject)$/);
      const id = match![1];
      const action = match![2];

      if (action === "approve") {
        const row = await env.DB.prepare("SELECT * FROM discovered_projects WHERE id = ?").bind(id).first();
        if (!row) return json({ error: "Not found" }, corsHeaders, 404);

        // Insert or replace into software
        await env.DB.prepare(`
          INSERT OR REPLACE INTO software
          (id, name, description, website_url, source_code_url, demo_url, stargazers_count, updated_at, archived, current_release_tag, current_release_published_at, platforms_json, tags_json, licenses_json, proprietary_alternatives, deploy_buttons_json, commit_history_json)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, NULL, ?, ?, ?, NULL, ?, NULL)
        `).bind(
          row.id,
          row.name,
          row.description,
          row.github_url,
          row.github_url,
          null,
          row.stargazers_count,
          new Date().toISOString().split("T")[0],
          JSON.stringify(row.llm_has_docker ? ["Docker"] : []),
          JSON.stringify(row.llm_category ? [row.llm_category] : []),
          JSON.stringify([]),
          JSON.stringify([])
        ).run();

        await env.DB.prepare("UPDATE discovered_projects SET status = 'approved', merged_into_software_id = ? WHERE id = ?").bind(row.id, id).run();
        return json({ success: true }, corsHeaders);
      } else {
        await env.DB.prepare("UPDATE discovered_projects SET status = 'rejected' WHERE id = ?").bind(id).run();
        return json({ success: true }, corsHeaders);
      }
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
