import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'

const dataDir = path.resolve(process.env.DATA_DIR ?? 'data')
fs.mkdirSync(dataDir, { recursive: true })

export const db = new Database(path.join(dataDir, 'sagala.db'))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  cover_image TEXT,
  published INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'sistem',
  summary TEXT NOT NULL DEFAULT '',
  image TEXT,
  tags TEXT NOT NULL DEFAULT '[]',
  repo TEXT UNIQUE,
  repo_url TEXT,
  demo_url TEXT,
  stars INTEGER NOT NULL DEFAULT 0,
  pushed_at TEXT,
  published INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`)

export const CATEGORIES = ['sistem', 'website', 'cctv', 'jaringan', 'perangkat', 'pengadaan', 'lainnya'] as const
export const CONTACT_KEYS = ['email', 'phone', 'whatsapp', 'address', 'hours', 'maps_url'] as const
const defaults: Record<string, string> = {
  email: 'halo@sagalatech.id',
  phone: '',
  whatsapp: '',
  address: '',
  hours: 'Senin - Jumat, 09.00 - 17.00 WIB',
  maps_url: '',
}
const seed = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)')
for (const [k, v] of Object.entries(defaults)) seed.run(k, v)
