import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Button, Field, Loading } from '@/components/ui'
import { type Project, api, send } from '@/lib/api'
import { categories } from '@/lib/content'

const empty = {
  title: '',
  category: 'sistem',
  summary: '',
  image: null as string | null,
  tags: '',
  repo: '',
  demo_url: '',
  published: false,
  sort_order: 0,
}

export default function ProjectEditor() {
  const { id } = useParams()
  const nav = useNavigate()
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!id) return
    api<Project>(`/admin/projects/${id}`)
      .then((p) => setForm({ ...p, tags: p.tags.join(', '), repo: p.repo ?? '', demo_url: p.demo_url ?? '', published: !!p.published }))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const set = <K extends keyof typeof empty>(k: K, v: (typeof empty)[K]) => setForm((f) => ({ ...f, [k]: v }))

  async function fillFromGithub() {
    setError('')
    try {
      const r = await api<{ repo: string; title: string; summary: string; tags: string[]; demo_url: string | null }>(`/admin/github/repo?name=${encodeURIComponent(form.repo)}`)
      setForm((f) => ({ ...f, repo: r.repo, title: f.title || r.title, summary: f.summary || r.summary, tags: f.tags || r.tags.join(', '), demo_url: f.demo_url || (r.demo_url ?? '') }))
    } catch (e) {
      setError((e as Error).message)
    }
  }

  async function upload(file: File) {
    const fd = new FormData()
    fd.append('file', file)
    try {
      const { url } = await api<{ url: string }>('/admin/upload', { method: 'POST', body: fd })
      set('image', url)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const body = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      repo: form.repo.trim() || null,
      demo_url: form.demo_url.trim() || null,
      sort_order: Number(form.sort_order) || 0,
    }
    try {
      await send(id ? 'PUT' : 'POST', id ? `/admin/projects/${id}` : '/admin/projects', body)
      nav('/admin/proyek')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Loading />
  return (
    <form onSubmit={submit} className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-ink">{id ? 'Edit Proyek' : 'Proyek Baru'}</h1>

      <div className="border border-slate-200 bg-white p-4">
        <Field label="Repo GitHub (opsional, untuk proyek sistem)" placeholder="owner/nama-repo atau URL" value={form.repo} onChange={(e) => set('repo', e.target.value)} />
        <Button type="button" variant="ghost" className="mt-2" disabled={!form.repo.trim()} onClick={fillFromGithub}>Isi dari GitHub</Button>
        <p className="mt-2 text-xs text-slate-500">Hanya repo publik. Mengisi judul, ringkasan, teknologi, dan demo yang masih kosong.</p>
      </div>

      <Field label="Judul" value={form.title} onChange={(e) => set('title', e.target.value)} required minLength={2} />
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Kategori</span>
        <select value={form.category} onChange={(e) => set('category', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
          {Object.entries(categories).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </label>
      <Field label="Ringkasan" textarea rows={3} value={form.summary} onChange={(e) => set('summary', e.target.value)} maxLength={600} />
      <Field label="Teknologi (pisahkan dengan koma)" value={form.tags} onChange={(e) => set('tags', e.target.value)} />
      <Field label="Link demo (opsional)" type="url" placeholder="https://…" value={form.demo_url} onChange={(e) => set('demo_url', e.target.value)} />
      <div>
        <span className="mb-1 block text-sm font-medium">Gambar / tangkapan layar</span>
        {form.image && (
          <div className="mb-2 flex items-center gap-3">
            <img src={form.image} alt="" className="h-24 rounded-md" />
            <Button type="button" variant="ghost" onClick={() => set('image', null)}>Hapus gambar</Button>
          </div>
        )}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} className="text-sm" />
        <p className="mt-1 text-xs text-slate-500">Tanpa gambar, kartu menampilkan panel gelap bergaya teknis.</p>
      </div>
      <Field label="Urutan (angka kecil tampil lebih dulu)" type="number" value={form.sort_order} onChange={(e) => set('sort_order', Number(e.target.value))} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} />
        Terbitkan di website
      </label>
      {error && <Alert>{error}</Alert>}
      <div className="flex gap-2">
        <Button disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan'}</Button>
        <Button type="button" variant="ghost" onClick={() => nav('/admin/proyek')}>Batal</Button>
      </div>
    </form>
  )
}
