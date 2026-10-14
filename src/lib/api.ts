import { useEffect, useState } from 'react'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const isForm = init.body instanceof FormData
  const res = await fetch(`/api${path}`, {
    credentials: 'same-origin',
    ...init,
    headers: isForm || !init.body ? init.headers : { 'Content-Type': 'application/json', ...init.headers },
    body: init.body && !isForm && typeof init.body !== 'string' ? JSON.stringify(init.body) : init.body,
  })
  const data = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(data?.error ?? 'Terjadi kesalahan', res.status)
  return data as T
}

export const send = <T = unknown>(method: string, path: string, body?: unknown) =>
  api<T>(path, { method, body: body as BodyInit })

export interface Article {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  cover_image: string | null
  published: number
  created_at: string
  updated_at: string
}
export type ContactInfo = Record<'email' | 'phone' | 'whatsapp' | 'address' | 'hours' | 'maps_url', string>
export interface Message {
  id: number
  name: string
  email: string
  subject: string
  body: string
  is_read: number
  created_at: string
}

export interface Project {
  id: number
  title: string
  category: string
  summary: string
  image: string | null
  tags: string[]
  repo: string | null
  repo_url: string | null
  demo_url: string | null
  stars: number
  pushed_at: string | null
  published: number
  sort_order: number
}

export const formatDate = (s: string) =>
  new Date(s.replace(' ', 'T') + 'Z').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

export function useFetch<T>(path: string, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let live = true
    setLoading(true)
    api<T>(path)
      .then((d) => live && (setData(d), setError('')))
      .catch((e: Error) => live && setError(e.message))
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ...deps])
  return { data, error, loading, setData }
}
