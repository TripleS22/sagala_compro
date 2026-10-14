import type { NextFunction, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from './db.ts'

const isProd = process.env.NODE_ENV === 'production'
const secret = process.env.JWT_SECRET || (isProd ? '' : 'dev-only-secret')
if (!secret) throw new Error('JWT_SECRET wajib diisi di production')

export const COOKIE = 'sagala_admin'
export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: isProd,
  maxAge: 1000 * 60 * 60 * 8,
}

export function signToken(id: number, username: string) {
  return jwt.sign({ id, username }, secret, { expiresIn: '8h' })
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = jwt.verify(req.cookies?.[COOKIE] ?? '', secret) as { id: number; username: string }
    res.locals.admin = payload
    next()
  } catch {
    res.status(401).json({ error: 'Tidak terautentikasi' })
  }
}

/** Buat akun admin dari ADMIN_USERNAME / ADMIN_PASSWORD bila belum ada admin. */
export function ensureAdmin() {
  const count = (db.prepare('SELECT COUNT(*) c FROM admins').get() as { c: number }).c
  if (count > 0) return
  const username = process.env.ADMIN_USERNAME
  const password = process.env.ADMIN_PASSWORD
  if (!username || !password) {
    console.warn('Belum ada admin. Set ADMIN_USERNAME dan ADMIN_PASSWORD lalu restart.')
    return
  }
  db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(
    username,
    bcrypt.hashSync(password, 12),
  )
  console.log(`Admin "${username}" dibuat.`)
}
