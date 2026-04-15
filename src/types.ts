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

export interface DiscoveredProject {
  id: string;
  source: string;
  source_url: string | null;
  name: string | null;
  description: string | null;
  github_url: string | null;
  stargazers_count: number | null;
  discovered_at: string | null;
  llm_confidence: number | null;
  llm_category: string | null;
  llm_has_docker: number | null;
  status: string;
  merged_into_software_id: string | null;
}

export interface DiscoveredResponse {
  total: number;
  page: number;
  limit: number;
  items: DiscoveredProject[];
  isAdmin: boolean;
}
