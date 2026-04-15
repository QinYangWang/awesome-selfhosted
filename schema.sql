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
