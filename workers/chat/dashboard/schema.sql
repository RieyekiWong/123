-- Quota metadata only. No conversation text, API keys, original IPs or player identity.
-- Safe to run again: existing records and limits are not reset.
CREATE TABLE IF NOT EXISTS chat_quota (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('session', 'chat')),
  ip TEXT NOT NULL,
  sid TEXT NOT NULL,
  at INTEGER NOT NULL,
  reserved INTEGER NOT NULL DEFAULT 0,
  lease_until INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS chat_quota_kind_time ON chat_quota(kind, at);
CREATE INDEX IF NOT EXISTS chat_quota_ip_time ON chat_quota(ip, kind, at);
CREATE INDEX IF NOT EXISTS chat_quota_session_time ON chat_quota(sid, kind, at);
