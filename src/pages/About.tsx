export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-ink">Tentang Sagala Tech</h1>
      <p className="mt-6 leading-relaxed">
        Sagala Tech adalah perusahaan teknologi yang berfokus pada pengembangan solusi digital yang praktis dan andal. Kami percaya
        teknologi terbaik adalah yang benar-benar menyelesaikan masalah nyata di lapangan.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-brand-50 p-6">
          <h2 className="font-semibold text-ink">Visi</h2>
          <p className="mt-2 text-sm">Menjadi mitra teknologi tepercaya bagi bisnis yang ingin tumbuh secara digital.</p>
        </div>
        <div className="rounded-xl bg-brand-50 p-6">
          <h2 className="font-semibold text-ink">Misi</h2>
          <p className="mt-2 text-sm">Menghadirkan produk berkualitas, komunikasi transparan, dan dukungan yang konsisten.</p>
        </div>
      </div>
    </div>
  )
}
