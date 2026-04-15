import type { DiscoveredResponse, ListResponse, Tag } from "./types";

const BASE = ""; // same origin

export async function fetchTags(): Promise<Tag[]> {
  const res = await fetch(`${BASE}/api/tags`);
  if (!res.ok) throw new Error("Failed to fetch tags");
  return res.json();
}

export async function fetchSoftware(params: {
  tag?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<ListResponse> {
  const qs = new URLSearchParams();
  if (params.tag) qs.set("tag", params.tag);
  if (params.search) qs.set("search", params.search);
  if (params.sort) qs.set("sort", params.sort);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  const res = await fetch(`${BASE}/api/software?${qs.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch software");
  return res.json();
}

export async function loginAdmin(username: string, password: string): Promise<{ token: string }> {
  const res = await fetch(`${BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function fetchDiscovered(params: {
  status?: string;
  page?: number;
  limit?: number;
  token?: string;
}): Promise<DiscoveredResponse> {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  const headers: Record<string, string> = {};
  if (params.token) headers["Authorization"] = `Bearer ${params.token}`;
  const res = await fetch(`${BASE}/api/discovered?${qs.toString()}`, { headers });
  if (!res.ok) throw new Error("Failed to fetch discovered");
  return res.json();
}

export async function reviewDiscovered(id: string, action: "approve" | "reject", token: string) {
  const res = await fetch(`${BASE}/api/discovered/${id}/${action}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Review failed");
  return res.json();
}
