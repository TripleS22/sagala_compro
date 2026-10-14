import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Button, Field, Loading } from '@/components/ui'
import { type Article, api, send } from '@/lib/api'

const empty = { title: '', excerpt: '', content: '', cover_image: null as string | null, published: false }

export default function ArticleEditor() {
  const { id } = useParams()
  const nav = useNavigate()
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!id) return
    api<Article>(`/admin/articles/${id}`)
      .then((a) => setForm({ ...a, published: !!a.published }))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const set = <K extends keyof typeof empty>(k: K, v: (typeof empty)[K]) => setForm((f) => ({ ...f, [k]: v }))

  async function upload(file: File) {
    const fd = new FormData()
    fd.append('file', file)
    try {
      const { url } = await api<{ url: string }>('/admin/upload', { method: 'POST', body: fd })
      set('cover_image', url)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await send(id ? 'PUT' : 'POST', id ? `/admin/articles/${id}` : '/admin/articles', form)
      nav('/admin')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Loading />
  return (
    <form onSubmit={submit} className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold text-ink">{id ? 'Edit Artikel' : 'Artikel Baru'}</h1>
      <Field label="Judul" value={form.title} onChange={(e) => set('title', e.target.value)} required minLength={3} />
      <Field label="Ringkasan" textarea rows={2} value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} maxLength={500} />
      <Field label="Isi artikel (pisahkan paragraf dengan baris kosong)" textarea rows={14} value={form.content} onChange={(e) => set('content', e.target.value)} />
      <div>
        <span className="mb-1 block text-sm font-medium">Gambar sampul</span>
        {form.cover_image && (
          <div className="mb-2 flex items-center gap-3">
            <img src={form.cover_image} alt="" className="h-24 rounded-lg" />
            <Button type="button" variant="ghost" onClick={() => set('cover_image', null)}>Hapus gambar</Button>
          </div>
        )}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} className="text-sm" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} />
        Terbitkan artikel
      </label>
      {error && <Alert>{error}</Alert>}
      <div className="flex gap-2">
        <Button disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan'}</Button>
        <Button type="button" variant="ghost" onClick={() => nav('/admin')}>Batal</Button>
      </div>
    </form>
  )
}
