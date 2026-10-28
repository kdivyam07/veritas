CREATE TABLE IF NOT EXISTS documents (
  id text NOT NULL,
  owner text NOT NULL,
  title text NOT NULL,
  kind text NOT NULL,
  content text NOT NULL,
  status text NOT NULL,
  access text NOT NULL,
  updated text NOT NULL,
  enabled integer NOT NULL DEFAULT 1,
  PRIMARY KEY (id, owner)
);
CREATE TABLE IF NOT EXISTS events (
  id text PRIMARY KEY,
  owner text NOT NULL,
  question text NOT NULL,
  outcome text NOT NULL,
  detail text NOT NULL,
  created text NOT NULL
);
CREATE INDEX IF NOT EXISTS events_owner_created ON events (owner, created DESC);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash text PRIMARY KEY,
  owner text NOT NULL,
  expires text NOT NULL
);
