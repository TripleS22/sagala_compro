export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-ink">Tentang Sagala Tech</h1>
      <p className="mt-6 leading-relaxed">
        Sagala Tech adalah perusahaan yang bergerak di bidang penyediaan jasa teknologi. Kami melayani pemasangan CCTV, konfigurasi
        jaringan, servis laptop, pengadaan barang, serta pembuatan sistem, website, dan aplikasi, juga kebutuhan teknologi lainnya
        untuk rumah tangga, usaha, dan instansi.
      </p>
      <p className="mt-4 leading-relaxed">
        Kami percaya solusi teknologi terbaik adalah yang benar-benar menyelesaikan masalah di lapangan: rapi dikerjakan, mudah
        digunakan, dan didukung layanan purna jual yang bisa diandalkan.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-brand-50 p-6">
          <h2 className="font-semibold text-ink">Visi</h2>
          <p className="mt-2 text-sm">Menjadi mitra teknologi tepercaya yang menghadirkan solusi IT lengkap dalam satu tempat.</p>
        </div>
        <div className="rounded-xl bg-brand-50 p-6">
          <h2 className="font-semibold text-ink">Misi</h2>
          <p className="mt-2 text-sm">Memberikan layanan berkualitas dengan pengerjaan rapi, harga transparan, dan dukungan teknis yang konsisten.</p>
        </div>
      </div>
    </div>
  )
}
