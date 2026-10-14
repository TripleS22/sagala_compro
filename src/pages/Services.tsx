export const services = [
  { title: 'Pengembangan Perangkat Lunak', desc: 'Aplikasi web dan mobile kustom yang dirancang sesuai proses bisnis Anda.' },
  { title: 'Website & Company Profile', desc: 'Website modern, cepat, dan mudah dikelola untuk membangun citra perusahaan.' },
  { title: 'Sistem Informasi', desc: 'Dashboard, otomasi, dan integrasi data untuk operasional yang efisien.' },
  { title: 'Infrastruktur & Cloud', desc: 'Setup server, deployment, dan pemeliharaan agar layanan Anda selalu tersedia.' },
  { title: 'Konsultasi IT', desc: 'Pendampingan strategi transformasi digital dan pemilihan teknologi.' },
  { title: 'Dukungan & Pemeliharaan', desc: 'Monitoring, pembaruan, dan bantuan teknis berkelanjutan.' },
]

export default function Services() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-bold text-ink">Layanan</h1>
      <p className="mt-2 max-w-2xl">Dari ide sampai operasional, kami membantu di setiap tahap.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <div key={s.title} className="rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-ink">{s.title}</h2>
            <p className="mt-2 text-sm">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
