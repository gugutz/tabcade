-- One row per secret library link. Only a SHA-256 of the key is stored, never the key itself.
CREATE TABLE libraries (
  key_hash TEXT PRIMARY KEY,
  ids TEXT NOT NULL,          -- JSON array of game ids ("developer/game")
  updated_at INTEGER NOT NULL -- unix ms
);
