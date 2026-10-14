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
import { CONTACT_KEYS, db } from './db.ts'

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
  if (err instanceof multer.MulterError) return void res.status(400).json({ error: err.message })
  console.error(err)
  res.status(500).json({ error: 'Terjadi kesalahan server' })
})

const port = Number(process.env.PORT ?? 3001)
app.listen(port, () => console.log(`Server berjalan di http://localhost:${port}`))
