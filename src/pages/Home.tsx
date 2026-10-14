import { Link } from 'react-router-dom'
import Silk from '@/components/Silk'
import TechText from '@/components/TechText'
import { reasons, services } from '@/lib/content'
import { type Article, formatDate, useFetch } from '@/lib/api'

export default function Home() {
  const { data } = useFetch<Article[]>('/articles')
  return (
    <>
      <section className="relative isolate overflow-hidden bg-brand-700 text-white">
        <Silk color="#0a6cae" sheenColor="#9fd4f5" speed={3} scale={1.1} noiseIntensity={1.2} className="absolute! inset-0 -z-10" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/10 to-brand-700/60" />
        <div className="mx-auto max-w-6xl px-4 py-20 text-center md:py-28">
          <h1>
            <span className="sr-only">Sagala Tech</span>
            <TechText
              text="SAGALA TECH"
              fontWeight={800}
              fontSize={150}
              letterSpacing={0.02}
              color="#ffffff"
              accentColor="#bae6fd"
              reach={160}
              dashLength={5}
              dashGap={3}
              className="mx-auto h-32 max-w-4xl sm:h-44 md:h-56"
            />
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-xl font-semibold text-sky-200 md:text-2xl">
            Mitra teknologi untuk rumah, usaha, dan instansi
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/85 md:text-lg">
            Pemasangan CCTV, konfigurasi jaringan, servis perangkat keras, pengadaan barang, hingga pembuatan sistem, website, dan aplikasi, semua dalam satu tempat.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/kontak" className="rounded-lg bg-white px-6 py-3 font-medium text-brand-700 hover:bg-brand-50">
              Hubungi Kami
            </Link>
            <Link to="/layanan" className="rounded-lg border border-white/50 px-6 py-3 font-medium text-white hover:bg-white/10">
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
