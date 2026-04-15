export interface Software {
  id: string;
  name: string;
  description: string | null;
  website_url: string | null;
  source_code_url: string | null;
  demo_url: string | null;
  stargazers_count: number | null;
  updated_at: string | null;
  archived: number;
  current_release_tag: string | null;
  current_release_published_at: string | null;
  platforms: string[] | null;
  tags: string[] | null;
  licenses: string[] | null;
  proprietary_alternatives: string | null;
  deploy_buttons: string[] | null;
  commit_history: Record<string, number> | null;
}

export interface Tag {
  name: string;
  description: string | null;
  related_tags: string[] | null;
}

export interface ListResponse {
  total: number;
  page: number;
  limit: number;
  items: Software[];
}
