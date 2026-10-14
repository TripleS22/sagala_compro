import { Link, useParams } from 'react-router-dom'
import { Loading } from '@/components/ui'
import { type Article, formatDate, useFetch } from '@/lib/api'

export default function ArticleDetail() {
  const { slug } = useParams()
  const { data, loading, error } = useFetch<Article>(`/articles/${slug}`)
  if (loading) return <Loading />
  if (error || !data)
    return (
      <div className="py-24 text-center">
        <p>Artikel tidak ditemukan.</p>
        <Link to="/artikel" className="text-brand-600">← Kembali</Link>
      </div>
    )
  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <Link to="/artikel" className="text-sm text-brand-600">← Semua artikel</Link>
      <h1 className="mt-4 text-3xl font-bold text-ink md:text-4xl">{data.title}</h1>
      <p className="mt-2 text-sm text-slate-500">{formatDate(data.created_at)}</p>
      {data.cover_image && <img src={data.cover_image} alt="" className="mt-8 w-full rounded-xl" />}
      <div className="mt-8 space-y-4 leading-relaxed">
        {data.content.split(/\n{2,}/).map((p, i) => (
          <p key={i} className="whitespace-pre-line">{p}</p>
        ))}
      </div>
    </article>
  )
}
