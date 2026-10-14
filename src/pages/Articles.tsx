import { Link } from 'react-router-dom'
import PageHeader from '@/components/PageHeader'
import { Loading } from '@/components/ui'
import { type Article, formatDate, useFetch } from '@/lib/api'

export default function Articles() {
  const { data, loading, error } = useFetch<Article[]>('/articles')
  return (
    <>
      <PageHeader no="04" label="Artikel" title="Catatan dan wawasan teknologi" />
      <div className="mx-auto max-w-6xl px-4 py-16">
        {loading && <Loading />}
        {error && <p className="text-red-600">{error}</p>}
        {data?.length === 0 && <p>Belum ada artikel.</p>}
        <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {data?.map((a) => (
            <Link key={a.id} to={`/artikel/${a.slug}`} className="group block">
              {a.cover_image ? (
                <img src={a.cover_image} alt="" className="aspect-[16/10] w-full object-cover" />
              ) : (
                <div className="bg-grid aspect-[16/10] w-full bg-night" />
              )}
              <p className="mt-4 font-mono text-xs text-slate-500">{formatDate(a.created_at)}</p>
              <h2 className="mt-1 text-lg font-semibold text-ink group-hover:text-brand-600">{a.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-slate-600">{a.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
