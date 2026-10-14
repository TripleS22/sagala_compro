import { Link } from 'react-router-dom'
import { Loading } from '@/components/ui'
import { type Article, formatDate, useFetch } from '@/lib/api'

export default function Articles() {
  const { data, loading, error } = useFetch<Article[]>('/articles')
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-bold text-ink">Artikel</h1>
      {loading && <Loading />}
      {error && <p className="mt-6 text-red-600">{error}</p>}
      {data?.length === 0 && <p className="mt-6">Belum ada artikel.</p>}
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data?.map((a) => (
          <Link key={a.id} to={`/artikel/${a.slug}`} className="overflow-hidden rounded-xl border border-slate-200 hover:shadow">
            {a.cover_image && <img src={a.cover_image} alt="" className="h-44 w-full object-cover" />}
            <div className="p-5">
              <p className="text-xs text-slate-500">{formatDate(a.created_at)}</p>
              <h2 className="mt-1 font-semibold text-ink">{a.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm">{a.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
