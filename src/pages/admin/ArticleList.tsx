import { Link } from 'react-router-dom'
import { Button, Loading } from '@/components/ui'
import { type Article, formatDate, send, useFetch } from '@/lib/api'

export default function ArticleList() {
  const { data, loading, error, setData } = useFetch<Article[]>('/admin/articles')

  async function remove(a: Article) {
    if (!confirm(`Hapus artikel "${a.title}"?`)) return
    await send('DELETE', `/admin/articles/${a.id}`)
    setData((data ?? []).filter((x) => x.id !== a.id))
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Artikel</h1>
        <Link to="/admin/artikel/baru" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white">+ Artikel Baru</Link>
      </div>
      {loading && <Loading />}
      {error && <p className="mt-4 text-red-600">{error}</p>}
      {data && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr><th className="p-3">Judul</th><th className="p-3">Status</th><th className="p-3">Dibuat</th><th className="p-3" /></tr>
            </thead>
            <tbody>
              {data.length === 0 && <tr><td colSpan={4} className="p-6 text-center">Belum ada artikel.</td></tr>}
              {data.map((a) => (
                <tr key={a.id} className="border-b border-slate-100 last:border-0">
                  <td className="p-3 font-medium text-ink">{a.title}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${a.published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {a.published ? 'Terbit' : 'Draf'}
                    </span>
                  </td>
                  <td className="p-3">{formatDate(a.created_at)}</td>
                  <td className="flex justify-end gap-2 p-3">
                    <Link to={`/admin/artikel/${a.id}`} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs">Edit</Link>
                    <Button variant="danger" className="!px-3 !py-1.5 text-xs" onClick={() => remove(a)}>Hapus</Button>
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
