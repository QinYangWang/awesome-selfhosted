CREATE TABLE IF NOT EXISTS software (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  website_url TEXT,
  source_code_url TEXT,
  demo_url TEXT,
  stargazers_count INTEGER,
  updated_at TEXT,
  archived INTEGER DEFAULT 0,
  current_release_tag TEXT,
  current_release_published_at TEXT,
  platforms_json TEXT,
  tags_json TEXT,
  licenses_json TEXT,
  proprietary_alternatives TEXT,
  deploy_buttons_json TEXT,
  commit_history_json TEXT
);

CREATE INDEX IF NOT EXISTS idx_software_tags ON software(tags_json);
CREATE INDEX IF NOT EXISTS idx_software_stargazers ON software(stargazers_count);
CREATE INDEX IF NOT EXISTS idx_software_updated ON software(updated_at);

CREATE TABLE IF NOT EXISTS tags (
  name TEXT PRIMARY KEY,
  description TEXT,
  related_tags_json TEXT
);

CREATE TABLE IF NOT EXISTS admin (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS discovered_projects (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  source_url TEXT,
  name TEXT,
  description TEXT,
  github_url TEXT,
  stargazers_count INTEGER,
  discovered_at TEXT,
  llm_confidence REAL,
  llm_category TEXT,
  llm_has_docker INTEGER,
  status TEXT DEFAULT 'pending',
  merged_into_software_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_discovered_status ON discovered_projects(status);
CREATE INDEX IF NOT EXISTS idx_discovered_source ON discovered_projects(source);
CREATE INDEX IF NOT EXISTS idx_discovered_date ON discovered_projects(discovered_at);
