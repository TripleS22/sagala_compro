import { Link } from 'react-router-dom'
import { reasons, services } from '@/lib/content'
import { type Article, formatDate, useFetch } from '@/lib/api'

export default function Home() {
  const { data } = useFetch<Article[]>('/articles')
  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-24 text-center">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-ink md:text-6xl">
            Mitra teknologi untuk <span className="text-brand-600">rumah, usaha, dan instansi</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Pemasangan CCTV, konfigurasi jaringan, servis laptop, pengadaan barang, hingga pembuatan sistem, website, dan aplikasi, semua dalam satu tempat.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/kontak" className="rounded-lg bg-brand-600 px-6 py-3 font-medium text-white hover:bg-brand-700">
              Hubungi Kami
            </Link>
            <Link to="/layanan" className="rounded-lg border border-slate-300 px-6 py-3 font-medium hover:bg-white">
              Lihat Layanan
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold text-ink">Layanan Kami</h2>
          <Link to="/layanan" className="text-sm font-medium text-brand-600">Semua layanan →</Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map(({ icon: Icon, ...s }) => (
            <div key={s.title} className="rounded-xl border border-slate-200 p-6">
              <span className="inline-flex size-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Icon className="size-6" />
              </span>
              <h3 className="mt-4 font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-600 text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-3">
          {reasons.map(({ icon: Icon, ...r }) => (
            <div key={r.title}>
              <Icon className="size-8 text-brand-100" />
              <h3 className="mt-3 font-semibold">{r.title}</h3>
              <p className="mt-1 text-sm text-brand-100">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {data && data.length > 0 && (
        <section className="bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-bold text-ink">Artikel Terbaru</h2>
              <Link to="/artikel" className="text-sm font-medium text-brand-600">
                Semua artikel →
              </Link>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {data.slice(0, 3).map((a) => (
                <Link key={a.id} to={`/artikel/${a.slug}`} className="rounded-xl bg-white p-6 shadow-sm hover:shadow">
                  <p className="text-xs text-slate-500">{formatDate(a.created_at)}</p>
                  <h3 className="mt-1 font-semibold text-ink">{a.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm">{a.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
