import PageHeader from '@/components/PageHeader'
import Reveal from '@/components/Reveal'
import { reasons } from '@/lib/content'

export default function About() {
  return (
    <>
      <PageHeader no="00" label="Tentang" title="Penyedia jasa teknologi yang bekerja dari kebutuhan nyata" />
      <div className="mx-auto grid max-w-6xl gap-16 px-4 py-20 md:grid-cols-5">
        <Reveal className="space-y-5 leading-relaxed md:col-span-3">
          <p className="text-lg text-ink">
            Sagala Tech bergerak di bidang penyediaan jasa teknologi: pemasangan CCTV, konfigurasi jaringan, servis perangkat keras,
            pengadaan barang, serta pembuatan sistem, website, dan aplikasi.
          </p>
          <p>
            Kami melayani rumah tangga, usaha, dan instansi. Pendekatan kami sederhana: pahami masalahnya lebih dulu, baru pilih
            teknologinya. Hasilnya harus rapi dikerjakan, mudah digunakan, dan tetap didukung setelah serah terima.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="md:col-span-2">
          <dl className="space-y-6 border-l border-slate-200 pl-6">
            <div>
              <dt className="font-mono text-xs tracking-widest text-brand-600 uppercase">Visi</dt>
              <dd className="mt-1 text-sm leading-relaxed">Menjadi mitra teknologi tepercaya yang menghadirkan solusi IT lengkap dalam satu tempat.</dd>
            </div>
            <div>
              <dt className="font-mono text-xs tracking-widest text-brand-600 uppercase">Misi</dt>
              <dd className="mt-1 text-sm leading-relaxed">Memberi layanan berkualitas dengan pengerjaan rapi, harga transparan, dan dukungan teknis yang konsisten.</dd>
            </div>
          </dl>
        </Reveal>
      </div>
      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-3">
          {reasons.map(({ icon: Icon, ...r }) => (
            <div key={r.title}>
              <Icon className="size-5 text-brand-600" strokeWidth={1.5} />
              <h3 className="mt-3 font-semibold text-ink">{r.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
