import fs from 'node:fs'
import path from 'node:path'
import bcrypt from 'bcryptjs'
import cookieParser from 'cookie-parser'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import multer from 'multer'
import { z } from 'zod'
import { COOKIE, cookieOptions, ensureAdmin, requireAdmin, signToken } from './auth.ts'
import { CATEGORIES, CONTACT_KEYS, db } from './db.ts'
import { GithubError, type GithubRepo, getRepo, listPublicRepos, parseRepo } from './github.ts'

ensureAdmin()

const app = express()
const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? 'uploads')
fs.mkdirSync(uploadDir, { recursive: true })

app.set('trust proxy', 1)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'img-src': ["'self'", 'data:'],
      },
    },
  }),
)
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.use('/uploads', express.static(uploadDir, { maxAge: '7d' }))

const api = express.Router()
const validate = <T extends z.ZodType>(schema: T, data: unknown): z.infer<T> => schema.parse(data)

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'artikel'

function uniqueSlug(base: string, ignoreId?: number) {
  let slug = base
  for (let i = 2; ; i++) {
    const row = db.prepare('SELECT id FROM articles WHERE slug = ?').get(slug) as { id: number } | undefined
    if (!row || row.id === ignoreId) return slug
    slug = `${base}-${i}`
  }
}

// ---------- Publik ----------
api.get('/articles', (_req, res) => {
  res.json(
    db
      .prepare(
        `SELECT id, slug, title, excerpt, cover_image, created_at FROM articles
         WHERE published = 1 ORDER BY created_at DESC`,
      )
      .all(),
  )
})

api.get('/articles/:slug', (req, res) => {
  const row = db.prepare('SELECT * FROM articles WHERE slug = ? AND published = 1').get(req.params.slug)
  if (!row) return void res.status(404).json({ error: 'Artikel tidak ditemukan' })
  res.json(row)
})

interface ProjectRow {
  id: number
  tags: string
  published: number
  [k: string]: unknown
}
const toProject = (r: ProjectRow) => ({ ...r, tags: JSON.parse(r.tags) as string[] })

api.get('/projects', (_req, res) => {
  const rows = db
    .prepare('SELECT * FROM projects WHERE published = 1 ORDER BY sort_order ASC, created_at DESC')
    .all() as ProjectRow[]
  res.json(rows.map(toProject))
})

api.get('/contact-info', (_req, res) => {
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[]
  res.json(Object.fromEntries(rows.map((r) => [r.key, r.value])))
})

const messageLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false })
const messageSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  subject: z.string().trim().max(200).default(''),
  body: z.string().trim().min(10).max(5000),
  website: z.string().optional(), // honeypot
})

api.post('/messages', messageLimiter, (req, res) => {
  const data = validate(messageSchema, req.body)
  if (data.website) return void res.status(201).json({ ok: true }) // bot: pura-pura sukses
  db.prepare('INSERT INTO messages (name, email, subject, body) VALUES (?, ?, ?, ?)').run(
    data.name,
    data.email,
    data.subject,
    data.body,
  )
  res.status(201).json({ ok: true })
})

// ---------- Auth ----------
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false })
const loginSchema = z.object({ username: z.string().min(1), password: z.string().min(1) })
const dummyHash = bcrypt.hashSync('dummy', 12)

api.post('/auth/login', loginLimiter, (req, res) => {
  const { username, password } = validate(loginSchema, req.body)
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username) as
    | { id: number; username: string; password_hash: string }
    | undefined
  const ok = bcrypt.compareSync(password, admin?.password_hash ?? dummyHash)
  if (!admin || !ok) return void res.status(401).json({ error: 'Username atau password salah' })
  res.cookie(COOKIE, signToken(admin.id, admin.username), cookieOptions)
  res.json({ username: admin.username })
})

api.post('/auth/logout', (_req, res) => {
  res.clearCookie(COOKIE, { ...cookieOptions, maxAge: undefined })
  res.json({ ok: true })
})

api.get('/auth/me', requireAdmin, (_req, res) => res.json({ username: res.locals.admin.username }))

// ---------- Admin ----------
const admin = express.Router()
admin.use(requireAdmin)

admin.get('/articles', (_req, res) => {
  res.json(
    db
      .prepare('SELECT id, slug, title, published, created_at, updated_at FROM articles ORDER BY created_at DESC')
      .all(),
  )
})

admin.get('/articles/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id)
  if (!row) return void res.status(404).json({ error: 'Artikel tidak ditemukan' })
  res.json(row)
})

const articleSchema = z.object({
  title: z.string().trim().min(3).max(200),
  excerpt: z.string().trim().max(500).default(''),
  content: z.string().max(200_000).default(''),
  cover_image: z.string().max(300).nullable().default(null),
  published: z.boolean().default(false),
})

admin.post('/articles', (req, res) => {
  const d = validate(articleSchema, req.body)
  const info = db
    .prepare('INSERT INTO articles (slug, title, excerpt, content, cover_image, published) VALUES (?, ?, ?, ?, ?, ?)')
    .run(uniqueSlug(slugify(d.title)), d.title, d.excerpt, d.content, d.cover_image, d.published ? 1 : 0)
  res.status(201).json({ id: info.lastInsertRowid })
})

admin.put('/articles/:id', (req, res) => {
  const id = Number(req.params.id)
  const d = validate(articleSchema, req.body)
  const existing = db.prepare('SELECT title, slug FROM articles WHERE id = ?').get(id) as
    | { title: string; slug: string }
    | undefined
  if (!existing) return void res.status(404).json({ error: 'Artikel tidak ditemukan' })
  // slug hanya berubah jika judul berubah, supaya link lama tetap valid
  const slug = d.title === existing.title ? existing.slug : uniqueSlug(slugify(d.title), id)
  db.prepare(
    `UPDATE articles SET slug=?, title=?, excerpt=?, content=?, cover_image=?, published=?, updated_at=datetime('now')
     WHERE id=?`,
  ).run(slug, d.title, d.excerpt, d.content, d.cover_image, d.published ? 1 : 0, id)
  res.json({ ok: true })
})

admin.delete('/articles/:id', (req, res) => {
  db.prepare('DELETE FROM articles WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

const contactSchema = z.object(
  Object.fromEntries(CONTACT_KEYS.map((k) => [k, z.string().trim().max(500).default('')])) as Record<
    (typeof CONTACT_KEYS)[number],
    z.ZodDefault<z.ZodString>
  >,
)
admin.put('/contact-info', (req, res) => {
  const d = validate(contactSchema, req.body)
  const upsert = db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
  )
  db.transaction(() => {
    for (const k of CONTACT_KEYS) upsert.run(k, d[k])
  })()
  res.json({ ok: true })
})

admin.get('/messages', (_req, res) => {
  res.json(db.prepare('SELECT * FROM messages ORDER BY created_at DESC').all())
})
admin.patch('/messages/:id', (req, res) => {
  const { is_read } = validate(z.object({ is_read: z.boolean() }), req.body)
  db.prepare('UPDATE messages SET is_read = ? WHERE id = ?').run(is_read ? 1 : 0, req.params.id)
  res.json({ ok: true })
})
admin.delete('/messages/:id', (req, res) => {
  db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

const projectSchema = z.object({
  title: z.string().trim().min(2).max(150),
  category: z.enum(CATEGORIES).default('sistem'),
  summary: z.string().trim().max(600).default(''),
  image: z.string().max(300).nullable().default(null),
  tags: z.array(z.string().trim().min(1).max(30)).max(8).default([]),
  repo: z.string().nullable().default(null),
  demo_url: z
    .string()
    .trim()
    .max(300)
    .regex(/^https?:\/\/\S+$/i, 'Harus diawali http:// atau https://')
    .nullable()
    .or(z.literal(''))
    .default(null),
  published: z.boolean().default(false),
  sort_order: z.number().int().default(0),
})

const repoTags = (r: GithubRepo) => [...new Set([r.language, ...r.topics].filter((t): t is string => !!t))].slice(0, 8)
const safeUrl = (u?: string | null) => (u && /^https?:\/\//i.test(u) ? u : null)

admin.get('/projects', (_req, res) => {
  const rows = db.prepare('SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC').all() as ProjectRow[]
  res.json(rows.map(toProject))
})

admin.get('/projects/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id) as ProjectRow | undefined
  if (!row) return void res.status(404).json({ error: 'Proyek tidak ditemukan' })
  res.json(toProject(row))
})

function saveProject(id: number | null, d: z.infer<typeof projectSchema>) {
  let repoFields: Record<string, unknown> = { repo: null, repo_url: null, stars: 0, pushed_at: null }
  if (d.repo) {
    const full = parseRepo(d.repo)
    if (!full) throw new GithubError('Format repo harus owner/nama-repo', 400)
    repoFields = { ...repoFields, repo: full, repo_url: `https://github.com/${full}` }
  }
  const demo = d.demo_url || null
  if (id === null) {
    return db
      .prepare(
        `INSERT INTO projects (title, category, summary, image, tags, repo, repo_url, demo_url, published, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(d.title, d.category, d.summary, d.image, JSON.stringify(d.tags), repoFields.repo, repoFields.repo_url, demo, d.published ? 1 : 0, d.sort_order)
      .lastInsertRowid
  }
  // data GitHub (bintang, push terakhir) dipertahankan; hanya diperbarui lewat sinkronisasi
  db.prepare(
    `UPDATE projects SET title=?, category=?, summary=?, image=?, tags=?, repo=?, repo_url=?, demo_url=?, published=?, sort_order=?,
       stars = CASE WHEN ? IS NULL THEN 0 ELSE stars END, pushed_at = CASE WHEN ? IS NULL THEN NULL ELSE pushed_at END
     WHERE id=?`,
  ).run(d.title, d.category, d.summary, d.image, JSON.stringify(d.tags), repoFields.repo, repoFields.repo_url, demo, d.published ? 1 : 0, d.sort_order, repoFields.repo, repoFields.repo, id)
  return id
}

admin.post('/projects', (req, res) => {
  const id = saveProject(null, validate(projectSchema, req.body))
  res.status(201).json({ id })
})
admin.put('/projects/:id', (req, res) => {
  const id = Number(req.params.id)
  if (!db.prepare('SELECT 1 FROM projects WHERE id = ?').get(id)) return void res.status(404).json({ error: 'Proyek tidak ditemukan' })
  saveProject(id, validate(projectSchema, req.body))
  res.json({ ok: true })
})
admin.delete('/projects/:id', (req, res) => {
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

// ---- GitHub ----
const githubUser = () => process.env.GITHUB_USERNAME ?? 'TripleS22'

/** Daftar repo publik milik akun (bukan fork/arsip) beserta status sudah diimpor atau belum. */
admin.get('/github/repos', async (_req, res) => {
  const repos = await listPublicRepos(githubUser())
  const imported = new Set((db.prepare('SELECT repo FROM projects WHERE repo IS NOT NULL').all() as { repo: string }[]).map((r) => r.repo.toLowerCase()))
  res.json({
    username: githubUser(),
    repos: repos.map((r) => ({
      full_name: r.full_name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      pushed_at: r.pushed_at,
      imported: imported.has(r.full_name.toLowerCase()),
    })),
  })
})

/** Data satu repo untuk mengisi formulir (tanpa menyimpan). */
admin.get('/github/repo', async (req, res) => {
  const full = parseRepo(String(req.query.name ?? ''))
  if (!full) throw new GithubError('Format repo harus owner/nama-repo', 400)
  const r = await getRepo(full)
  res.json({
    repo: r.full_name,
    title: r.name.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    summary: r.description ?? '',
    tags: repoTags(r),
    demo_url: safeUrl(r.homepage),
    stars: r.stargazers_count,
  })
})

const importSchema = z.object({ repos: z.array(z.string()).min(1).max(30) })
/** Impor beberapa repo sebagai proyek berstatus DRAF; admin meninjau sebelum diterbitkan. */
admin.post('/github/import', async (req, res) => {
  const { repos } = validate(importSchema, req.body)
  const done: string[] = []
  const failed: { repo: string; error: string }[] = []
  const insert = db.prepare(
    `INSERT OR IGNORE INTO projects (title, category, summary, tags, repo, repo_url, demo_url, stars, pushed_at, published)
     VALUES (?, 'sistem', ?, ?, ?, ?, ?, ?, ?, 0)`,
  )
  for (const input of repos) {
    const full = parseRepo(input)
    if (!full) {
      failed.push({ repo: input, error: 'Format tidak valid' })
      continue
    }
    try {
      const r = await getRepo(full)
      const title = r.name.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      const info = insert.run(title, r.description ?? '', JSON.stringify(repoTags(r)), r.full_name, r.html_url, safeUrl(r.homepage), r.stargazers_count, r.pushed_at)
      if (info.changes) done.push(full)
      else failed.push({ repo: full, error: 'Sudah diimpor' })
    } catch (e) {
      failed.push({ repo: full, error: e instanceof GithubError ? e.message : 'Gagal' })
    }
  }
  res.json({ imported: done, failed })
})

/** Perbarui bintang, tanggal push, dan teknologi dari GitHub; judul/ringkasan hasil suntingan admin tidak ditimpa. */
admin.post('/github/sync', async (_req, res) => {
  const rows = db.prepare('SELECT id, repo, tags FROM projects WHERE repo IS NOT NULL').all() as { id: number; repo: string; tags: string }[]
  const update = db.prepare('UPDATE projects SET stars = ?, pushed_at = ?, repo_url = ? WHERE id = ?')
  let updated = 0
  const failed: { repo: string; error: string }[] = []
  for (const row of rows) {
    try {
      const r = await getRepo(row.repo)
      update.run(r.stargazers_count, r.pushed_at, r.html_url, row.id)
      updated++
    } catch (e) {
      failed.push({ repo: row.repo, error: e instanceof GithubError ? e.message : 'Gagal' })
      // repo yang berubah menjadi privat langsung disembunyikan dari publik
      if (e instanceof GithubError && (e.status === 400 || e.status === 404)) db.prepare('UPDATE projects SET published = 0 WHERE id = ?').run(row.id)
    }
  }
  res.json({ updated, failed })
})

const imageTypes: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
}
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_req, file, cb) =>
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${imageTypes[file.mimetype]}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype in imageTypes),
})
admin.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return void res.status(400).json({ error: 'File harus berupa gambar (jpg, png, webp, gif) maks 5MB' })
  res.status(201).json({ url: `/uploads/${req.file.filename}` })
})

api.use('/admin', admin)
app.use('/api', api)
app.use('/api', (_req, res) => void res.status(404).json({ error: 'Not found' }))

// ---------- Frontend (production) ----------
const dist = path.resolve('dist')
if (fs.existsSync(dist)) {
  app.use(express.static(dist))
  app.get('*splat', (_req, res) => res.sendFile(path.join(dist, 'index.html')))
}

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof z.ZodError) {
    return void res.status(400).json({ error: 'Data tidak valid', details: err.flatten().fieldErrors })
  }
  if (err instanceof GithubError) return void res.status(err.status === 502 ? 502 : err.status).json({ error: err.message })
  if (err instanceof multer.MulterError) return void res.status(400).json({ error: err.message })
  console.error(err)
  res.status(500).json({ error: 'Terjadi kesalahan server' })
})

const port = Number(process.env.PORT ?? 3001)
app.listen(port, () => console.log(`Server berjalan di http://localhost:${port}`))
