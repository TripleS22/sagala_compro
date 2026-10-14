import { z } from 'zod'

const API = process.env.GITHUB_API ?? 'https://api.github.com'
const TOKEN = process.env.GITHUB_TOKEN // opsional, hanya untuk menaikkan batas rate (60 -> 5000/jam)

const repoSchema = z.object({
  full_name: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  html_url: z.string(),
  homepage: z.string().nullable().optional(),
  language: z.string().nullable(),
  topics: z.array(z.string()).optional().default([]),
  stargazers_count: z.number(),
  pushed_at: z.string().nullable(),
  private: z.boolean(),
  fork: z.boolean(),
  archived: z.boolean(),
  visibility: z.string().optional(),
})
export type GithubRepo = z.infer<typeof repoSchema>

export class GithubError extends Error {
  status: number
  constructor(message: string, status = 502) {
    super(message)
    this.status = status
  }
}

async function gh(path: string): Promise<unknown> {
  let res: Response
  try {
    res = await fetch(`${API}${path}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'sagala-compro',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      },
      signal: AbortSignal.timeout(10_000),
    })
  } catch {
    throw new GithubError('Tidak dapat menghubungi GitHub')
  }
  if (res.status === 404) throw new GithubError('Repo tidak ditemukan atau bersifat privat', 404)
  if (res.status === 403 || res.status === 429) {
    throw new GithubError('Batas permintaan GitHub tercapai, coba lagi nanti (atau set GITHUB_TOKEN)', 429)
  }
  if (!res.ok) throw new GithubError(`GitHub membalas ${res.status}`)
  return res.json()
}

const NAME = /^[A-Za-z0-9._-]{1,100}$/

/** Terima "owner/repo" atau URL github.com/owner/repo; kembalikan "owner/repo" atau null. */
export function parseRepo(input: string): string | null {
  const m = input.trim().match(/^(?:https?:\/\/github\.com\/)?([^/\s]+)\/([^/\s#?]+?)(?:\.git)?\/?$/i)
  return m && NAME.test(m[1]) && NAME.test(m[2]) ? `${m[1]}/${m[2]}` : null
}

/** Hanya repo publik yang boleh ditampilkan, walau token mampu membaca repo privat. */
function assertPublic(repo: GithubRepo) {
  if (repo.private || (repo.visibility && repo.visibility !== 'public')) {
    throw new GithubError('Repo privat tidak boleh ditampilkan di website', 400)
  }
  return repo
}

export async function getRepo(fullName: string): Promise<GithubRepo> {
  return assertPublic(repoSchema.parse(await gh(`/repos/${fullName}`)))
}

let listCache: { key: string; at: number; data: GithubRepo[] } | null = null

export async function listPublicRepos(username: string): Promise<GithubRepo[]> {
  if (!NAME.test(username)) throw new GithubError('Username GitHub tidak valid', 400)
  if (listCache && listCache.key === username && Date.now() - listCache.at < 10 * 60_000) return listCache.data
  const raw = await gh(`/users/${username}/repos?type=owner&sort=pushed&per_page=100`)
  const data = z
    .array(repoSchema)
    .parse(raw)
    .filter((r) => !r.private && !r.fork && !r.archived)
  listCache = { key: username, at: Date.now(), data }
  return data
}
