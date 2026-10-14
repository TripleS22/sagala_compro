import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Loading } from '@/components/ui'
import { type Project, api, send, useFetch } from '@/lib/api'
import { categories } from '@/lib/content'

interface RepoItem {
  full_name: string
  description: string | null
  language: string | null
  stars: number
  imported: boolean
}

export default function ProjectList() {
  const { data, loading, error, setData } = useFetch<Project[]>('/admin/projects')
  const [picker, setPicker] = useState<{ username: string; repos: RepoItem[] } | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [note, setNote] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const reload = async () => {
    setData(await api<Project[]>('/admin/projects'))
  }

  async function run(fn: () => Promise<void>) {
    setBusy(true)
    setNote(null)
    try {
      await fn()
    } catch (e) {
      setNote({ kind: 'error', text: (e as Error).message })
    } finally {
      setBusy(false)
    }
  }

  const openPicker = () =>
    run(async () => {
      setPicker(await api('/admin/github/repos'))
      setSelected([])
    })

  const doImport = () =>
    run(async () => {
      const r = await send<{ imported: string[]; failed: { repo: string; error: string }[] }>('POST', '/admin/github/import', { repos: selected })
      const fail = r.failed.length ? ` Gagal: ${r.failed.map((f) => `${f.repo} (${f.error})`).join(', ')}.` : ''
      setNote({ kind: r.imported.length ? 'ok' : 'error', text: `${r.imported.length} repo diimpor sebagai draf.${fail} Tinjau lalu terbitkan.` })
      setPicker(null)
      await reload()
    })

  const sync = () =>
    run(async () => {
      const r = await send<{ updated: number; failed: { repo: string; error: string }[] }>('POST', '/admin/github/sync')
      const fail = r.failed.length ? ` Gagal: ${r.failed.map((f) => `${f.repo} (${f.error})`).join(', ')}.` : ''
      setNote({ kind: r.failed.length ? 'error' : 'ok', text: `${r.updated} proyek diperbarui dari GitHub.${fail}` })
      await reload()
    })

  async function togglePublish(p: Project) {
    await send('PUT', `/admin/projects/${p.id}`, { ...p, published: !p.published })
    await reload()
  }
  async function remove(p: Project) {
    if (!confirm(`Hapus proyek "${p.title}"?`)) return
    await send('DELETE', `/admin/projects/${p.id}`)
    setData((data ?? []).filter((x) => x.id !== p.id))
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-ink">Proyek</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" disabled={busy} onClick={sync}>Sinkron GitHub</Button>
          <Button variant="ghost" disabled={busy} onClick={openPicker}>Impor dari GitHub</Button>
          <Link to="/admin/proyek/baru" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white">+ Proyek Baru</Link>
        </div>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        Proyek sistem diambil dari repo GitHub <b>publik</b>. Hasil impor berstatus draf dan baru tampil di website setelah Anda menerbitkannya. Repo privat tidak pernah ditampilkan.
      </p>
      {note && <div className="mt-4"><Alert kind={note.kind}>{note.text}</Alert></div>}

      {picker && (
        <div className="mt-6 border border-slate-200 bg-white p-4">
          <p className="font-semibold text-ink">Repo publik @{picker.username}</p>
          <ul className="mt-3 max-h-80 divide-y divide-slate-100 overflow-y-auto text-sm">
            {picker.repos.map((r) => (
              <li key={r.full_name}>
                <label className={`flex items-start gap-3 py-2 ${r.imported ? 'opacity-50' : 'cursor-pointer'}`}>
                  <input
                    type="checkbox"
                    disabled={r.imported}
                    checked={selected.includes(r.full_name)}
                    onChange={(e) => setSelected(e.target.checked ? [...selected, r.full_name] : selected.filter((x) => x !== r.full_name))}
                    className="mt-1"
                  />
                  <span>
                    <span className="font-medium text-ink">{r.full_name}</span>
                    {r.imported && <span className="ml-2 text-xs text-slate-500">sudah diimpor</span>}
                    <span className="block text-slate-600">{r.description || '(tanpa deskripsi)'}</span>
                    <span className="font-mono text-xs text-slate-500">{r.language ?? '-'} · ★ {r.stars}</span>
                  </span>
                </label>
              </li>
            ))}
            {picker.repos.length === 0 && <li className="py-3">Tidak ada repo publik.</li>}
          </ul>
          <div className="mt-4 flex gap-2">
            <Button disabled={busy || selected.length === 0} onClick={doImport}>Impor {selected.length || ''} terpilih</Button>
            <Button variant="ghost" onClick={() => setPicker(null)}>Tutup</Button>
          </div>
        </div>
      )}

      {loading && <Loading />}
      {error && <p className="mt-4 text-red-600">{error}</p>}
      {data && (
        <div className="mt-6 overflow-x-auto border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr><th className="p-3">Proyek</th><th className="p-3">Kategori</th><th className="p-3">Status</th><th className="p-3" /></tr>
            </thead>
            <tbody>
              {data.length === 0 && <tr><td colSpan={4} className="p-6 text-center">Belum ada proyek.</td></tr>}
              {data.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0">
                  <td className="p-3">
                    <p className="font-medium text-ink">{p.title}</p>
                    {p.repo && <p className="font-mono text-xs text-slate-500">{p.repo}</p>}
                  </td>
                  <td className="p-3">{categories[p.category] ?? p.category}</td>
                  <td className="p-3">
                    <button onClick={() => togglePublish(p)} className={`rounded-full px-2.5 py-0.5 text-xs ${p.published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`} title="Klik untuk ubah status">
                      {p.published ? 'Terbit' : 'Draf'}
                    </button>
                  </td>
                  <td className="flex justify-end gap-2 p-3">
                    <Link to={`/admin/proyek/${p.id}`} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs">Edit</Link>
                    <Button variant="danger" className="!px-3 !py-1.5 text-xs" onClick={() => remove(p)}>Hapus</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
