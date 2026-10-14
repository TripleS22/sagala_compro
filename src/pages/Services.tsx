import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { services } from '@/lib/content'

export default function Services() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-bold text-ink">Layanan</h1>
      <p className="mt-2 max-w-2xl">Solusi teknologi lengkap untuk rumah, usaha, dan instansi.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map(({ icon: Icon, ...s }) => (
          <div key={s.title} className="rounded-xl border border-slate-200 p-6">
            <span className="inline-flex size-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Icon className="size-6" />
            </span>
            <h2 className="mt-4 font-semibold text-ink">{s.title}</h2>
            <p className="mt-2 text-sm">{s.desc}</p>
            <ul className="mt-4 space-y-1.5 text-sm">
              {s.points.map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand-600" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-12 rounded-xl bg-brand-50 p-8 text-center">
        <p className="text-lg font-semibold text-ink">Butuh layanan yang belum tercantum?</p>
        <p className="mt-1 text-sm">Ceritakan kebutuhan Anda, kami carikan solusinya.</p>
        <Link to="/kontak" className="mt-4 inline-block rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700">
          Konsultasi Gratis
        </Link>
      </div>
    </div>
  )
}
