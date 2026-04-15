import type { ListResponse, Tag } from "./types";

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
