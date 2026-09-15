CREATE TABLE IF NOT EXISTS spots (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available','reserved','pending','sold')),
  reservation_token TEXT,
  reserved_until INTEGER,
  brand TEXT,
  email TEXT,
  x_profile TEXT,
  destination TEXT,
  network TEXT,
  transaction_url TEXT UNIQUE,
  updated_at INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO spots(id) VALUES
('F1'),('F2'),('F3'),('F4'),('B0'),('B1'),('B2'),('B3'),('B4'),('S1'),('S2');
