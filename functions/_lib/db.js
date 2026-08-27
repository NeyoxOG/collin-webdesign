export async function ensureSchema(env){
  if(!env.DB) throw new Error('DB_BINDING_MISSING');
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    project_type TEXT NOT NULL,
    pages_name TEXT,
    domain_help TEXT,
    message TEXT NOT NULL,
    details_json TEXT,
    chat_token_hash TEXT,
    project_status TEXT NOT NULL DEFAULT 'requested',
    status_note TEXT,
    confirmed_at TEXT,
    updated_at TEXT,
    created_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    ip_hash TEXT
  )`).run();
  for(const sql of [
    'ALTER TABLE inquiries ADD COLUMN phone TEXT',
    'ALTER TABLE inquiries ADD COLUMN details_json TEXT',
    'ALTER TABLE inquiries ADD COLUMN chat_token_hash TEXT',
    "ALTER TABLE inquiries ADD COLUMN project_status TEXT NOT NULL DEFAULT 'requested'",
    'ALTER TABLE inquiries ADD COLUMN status_note TEXT',
    'ALTER TABLE inquiries ADD COLUMN confirmed_at TEXT',
    'ALTER TABLE inquiries ADD COLUMN updated_at TEXT'
  ]){
    try{await env.DB.prepare(sql).run()}catch(e){if(!String(e?.message||e).toLowerCase().includes('duplicate column'))throw e}
  }
  await env.DB.prepare("UPDATE inquiries SET project_status='requested' WHERE project_status IS NULL OR project_status='' ").run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at DESC)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_inquiries_ip_created ON inquiries(ip_hash, created_at)').run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS login_attempts (
    ip TEXT PRIMARY KEY,
    failed_count INTEGER NOT NULL DEFAULT 0,
    locked_until INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL
  )`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    inquiry_id TEXT NOT NULL,
    sender TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_messages_inquiry_created ON messages(inquiry_id, created_at)').run();
}
