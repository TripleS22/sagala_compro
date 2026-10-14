import { Cctv, Code, Cpu, Headset, Network, PackageCheck, ShieldCheck, Wrench, Handshake } from 'lucide-react'

export const services = [
  {
    icon: Cctv,
    title: 'Pemasangan CCTV',
    desc: 'Survei lokasi, instalasi kamera indoor/outdoor, hingga pemantauan jarak jauh lewat ponsel.',
    points: ['Analog & IP camera', 'Perekaman DVR/NVR', 'Akses dari smartphone'],
  },
  {
    icon: Network,
    title: 'Konfigurasi Jaringan',
    desc: 'Perancangan dan konfigurasi jaringan kantor, WiFi, router, dan kabel LAN yang stabil dan aman.',
    points: ['Instalasi kabel LAN & access point', 'Konfigurasi router/firewall/VLAN', 'Troubleshooting jaringan'],
  },
  {
    icon: Cpu,
    title: 'Servis Perangkat Keras',
    desc: 'Perbaikan dan perawatan perangkat keras: laptop, komputer, dan perangkat pendukung lainnya.',
    points: ['Diagnosa & perbaikan kerusakan hardware', 'Ganti komponen & upgrade RAM/SSD', 'Pembersihan dan perawatan berkala'],
  },
  {
    icon: PackageCheck,
    title: 'Pengadaan Barang',
    desc: 'Penyediaan perangkat IT untuk instansi dan perusahaan: laptop, jaringan, CCTV, dan perlengkapan kantor.',
    points: ['Barang original bergaransi', 'Penawaran kompetitif', 'Pengiriman & instalasi'],
  },
  {
    icon: Code,
    title: 'Sistem, Website & Aplikasi',
    desc: 'Pembuatan sistem informasi, website company profile, toko online, dan aplikasi sesuai kebutuhan bisnis.',
    points: ['Web & aplikasi custom', 'Dashboard & otomasi proses', 'Hosting dan pemeliharaan'],
  },
  {
    icon: Headset,
    title: 'Layanan Teknologi Lainnya',
    desc: 'Konsultasi IT, maintenance berkala, dan solusi teknologi lain sesuai kebutuhan Anda.',
    points: ['Maintenance berkala', 'Konsultasi & rekomendasi', 'Dukungan teknis'],
  },
]

export const reasons = [
  { icon: Wrench, title: 'Satu pintu untuk kebutuhan IT', desc: 'Dari perangkat keras hingga perangkat lunak, ditangani satu tim.' },
  { icon: ShieldCheck, title: 'Pengerjaan rapi & bergaransi', desc: 'Instalasi dan perbaikan dikerjakan sesuai standar dengan garansi layanan.' },
  { icon: Handshake, title: 'Solusi sesuai kebutuhan', desc: 'Kami mulai dari memahami masalah Anda, bukan sekadar menjual produk.' },
]

export const steps = [
  { title: 'Konsultasi', desc: 'Kami dengarkan kebutuhan dan kondisi lokasi atau sistem Anda.' },
  { title: 'Survei & penawaran', desc: 'Survei bila perlu, lalu penawaran yang jelas: lingkup, waktu, dan biaya.' },
  { title: 'Pengerjaan', desc: 'Instalasi, konfigurasi, atau pengembangan dikerjakan rapi dan terdokumentasi.' },
  { title: 'Serah terima & dukungan', desc: 'Uji bersama, penjelasan penggunaan, dan dukungan teknis setelahnya.' },
]
