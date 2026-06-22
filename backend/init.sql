-- SpaceAnchor SQLite Database Initializer
-- Honkai: Star Rail Themed Link Shortener and Analytics Node

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', -- 'admin' or 'user'
  is_temporary INTEGER DEFAULT 1,     -- 1 if temp password, 0 if changed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS domains (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain_name TEXT UNIQUE NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  original_url TEXT NOT NULL,
  short_id TEXT NOT NULL,
  domain_id INTEGER NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  description TEXT,
  password TEXT, -- Plain text or hashed passcode. For simplicity in local debugging, we'll store passcode as text or simple hash.
  expires_at DATETIME,
  max_clicks INTEGER,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_link_on_domain UNIQUE(domain_id, short_id)
);

CREATE TABLE IF NOT EXISTS clicks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  link_id INTEGER NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  referrer TEXT DEFAULT 'Direct',
  browser TEXT DEFAULT 'Unknown',
  os TEXT DEFAULT 'Unknown',
  country TEXT DEFAULT 'Unknown',
  ip_address TEXT,
  device_type TEXT DEFAULT 'Desktop'
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Seed basic domains if they do not exist
INSERT OR IGNORE INTO domains (id, domain_name, is_active) VALUES (1, 'localhost:4040', 1);
INSERT OR IGNORE INTO domains (id, domain_name, is_active) VALUES (2, 'spaceanchor.io', 1);
INSERT OR IGNORE INTO domains (id, domain_name, is_active) VALUES (3, 'herta.station', 1);
INSERT OR IGNORE INTO domains (id, domain_name, is_active) VALUES (4, 'genius.wiki', 1);
