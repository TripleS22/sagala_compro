import { ArrowUpRight } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import Eyebrow from '@/components/Eyebrow'
import Magnet from '@/components/Magnet'
import Reveal from '@/components/Reveal'
import ServiceGrid from '@/components/ServiceGrid'
import { type Article, formatDate, useFetch } from '@/lib/api'
import { reasons, steps } from '@/lib/content'

// Komponen WebGL/canvas dimuat terpisah agar konten teks tampil lebih dulu
const Silk = lazy(() => import('@/components/Silk'))
const TechText = lazy(() => import('@/components/TechText'))
const LetterGlitch = lazy(() => import('@/components/LetterGlitch'))

export default function Home() {
  const { data } = useFetch<Article[]>('/articles')
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-brand-700 text-white">
        <Suspense fallback={null}>
          <Silk color="#0a6cae" sheenColor="#9fd4f5" speed={3} scale={1.1} noiseIntensity={1.2} className="absolute! inset-0 -z-10" />
        </Suspense>
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/10 to-brand-700/60" />
        <div className="mx-auto max-w-6xl px-4 py-20 text-center md:py-28">
          <Eyebrow dark>Jasa teknologi terpadu</Eyebrow>
          <h1 className="mt-4">
            <span className="sr-only">Sagala Tech</span>
            <Suspense fallback={<span aria-hidden className="block h-32 sm:h-44 md:h-56" />}>
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
            </Suspense>
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-xl font-medium text-sky-100 md:text-2xl">
            Mitra teknologi untuk rumah, usaha, dan instansi
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 md:text-lg">
            Pemasangan CCTV, konfigurasi jaringan, servis perangkat keras, pengadaan barang, hingga pembuatan sistem, website, dan aplikasi, semua dalam satu tempat.
          </p>
          <div className="mt-9 flex justify-center gap-3">
            <Magnet padding={50} magnetStrength={4}>
              <Link to="/kontak" className="inline-block rounded-md bg-white px-6 py-3 font-medium text-brand-700">
                Hubungi Kami
              </Link>
            </Magnet>
            <Link to="/layanan" className="rounded-md border border-white/40 px-6 py-3 font-medium text-white transition hover:bg-white/10">
              Lihat Layanan
            </Link>
          </div>
        </div>
      </section>

      {/* Layanan */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow no="01">Layanan</Eyebrow>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-ink md:text-4xl">
              Satu tim untuk perangkat keras dan perangkat lunak
            </h2>
          </div>
          <Link to="/layanan" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
            Detail layanan <ArrowUpRight className="size-4" />
          </Link>
        </Reveal>
        <div className="mt-12">
          <ServiceGrid />
        </div>
      </section>

      {/* Cara kerja */}
      <section className="relative isolate overflow-hidden bg-night text-white">
        <div className="bg-grid absolute inset-0 -z-10" />
        <div className="mx-auto max-w-6xl px-4 py-24">
          <Reveal>
            <Eyebrow no="02" dark>Cara kerja</Eyebrow>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">Proses yang jelas dari awal sampai akhir</h2>
          </Reveal>
          <ol className="mt-14 grid gap-10 md:grid-cols-4 md:gap-0">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.1} distance={20}>
                <li className="relative md:pr-8">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-sky-300">{String(i + 1).padStart(2, '0')}</span>
                    <span className="h-px flex-1 bg-white/15" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{s.desc}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Mengapa */}
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-24 md:grid-cols-5">
        <Reveal className="md:col-span-2">
          <Eyebrow no="03">Mengapa Sagala Tech</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-4xl">Teknologi yang menyelesaikan masalah di lapangan</h2>
        </Reveal>
        <div className="md:col-span-3">
          {reasons.map(({ icon: Icon, ...r }, i) => (
            <Reveal key={r.title} delay={i * 0.08} distance={16}>
              <div className="flex gap-5 border-t border-slate-200 py-7 first:border-t-0 first:pt-0">
                <Icon className="mt-0.5 size-5 shrink-0 text-brand-600" strokeWidth={1.5} />
                <div>
                  <h3 className="font-semibold text-ink">{r.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{r.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Artikel */}
      {data && data.length > 0 && (
        <section className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-24">
            <Reveal className="flex items-end justify-between gap-4">
              <div>
                <Eyebrow no="04">Artikel</Eyebrow>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-4xl">Catatan terbaru</h2>
              </div>
              <Link to="/artikel" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
                Semua artikel <ArrowUpRight className="size-4" />
              </Link>
            </Reveal>
            <div className="mt-10 border-t border-slate-300">
              {data.slice(0, 4).map((a) => (
                <Link
                  key={a.id}
                  to={`/artikel/${a.slug}`}
                  className="group grid items-baseline gap-2 border-b border-slate-300 py-6 md:grid-cols-[10rem_1fr_auto] md:gap-8"
                >
                  <span className="font-mono text-xs text-slate-500">{formatDate(a.created_at)}</span>
                  <div>
                    <h3 className="font-semibold text-ink group-hover:text-brand-600">{a.title}</h3>
                    {a.excerpt && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{a.excerpt}</p>}
                  </div>
                  <ArrowUpRight className="hidden size-5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-600 md:block" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative isolate overflow-hidden bg-night text-white">
        <Suspense fallback={null}>
        <LetterGlitch
          glitchColors={['#0a6cae', '#1d8acd', '#9fd4f5']}
          baseColor="#16507d"
          backgroundColor="#06111d"
          characters="01<>/{}[]#"
          fontSize={14}
          baseOpacity={0.75}
          glitchAmount={0.3}
          speed={0.6}
          edgeFade={0.35}
          centerFade={0.65}
          className="absolute! inset-0 -z-10"
        />
        </Suspense>
        <div className="mx-auto max-w-3xl px-4 py-28 text-center">
          <Eyebrow dark>Mulai dari percakapan</Eyebrow>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">Ada kebutuhan teknologi yang perlu dibereskan?</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70">Ceritakan singkat kebutuhan Anda. Kami balas dengan langkah yang jelas.</p>
          <div className="mt-9 flex justify-center">
            <Magnet padding={60} magnetStrength={4}>
              <Link to="/kontak" className="inline-block rounded-md bg-white px-7 py-3.5 font-medium text-brand-700">
                Hubungi Kami
              </Link>
            </Magnet>
          </div>
        </div>
      </section>
    </>
  )
}
