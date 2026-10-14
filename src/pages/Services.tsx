import { Link } from 'react-router-dom'
import PageHeader from '@/components/PageHeader'
import ServiceGrid from '@/components/ServiceGrid'

export default function Services() {
  return (
    <>
      <PageHeader no="01" label="Layanan" title="Solusi teknologi lengkap untuk rumah, usaha, dan instansi">
        Dari perangkat keras sampai perangkat lunak, kami membantu di setiap tahap.
      </PageHeader>
      <div className="mx-auto max-w-6xl px-4 py-20">
        <ServiceGrid detailed />
        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-8">
          <div>
            <p className="text-lg font-semibold text-ink">Butuh layanan yang belum tercantum?</p>
            <p className="mt-1 text-sm text-slate-600">Ceritakan kebutuhan Anda, kami carikan solusinya.</p>
          </div>
          <Link to="/kontak" className="rounded-md bg-brand-600 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700">
            Konsultasi
          </Link>
        </div>
      </div>
    </>
  )
}
