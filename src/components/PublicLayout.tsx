import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { type ContactInfo, useFetch } from '@/lib/api'

const links = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/tentang', label: 'Tentang' },
  { to: '/layanan', label: 'Layanan' },
  { to: '/artikel', label: 'Artikel' },
  { to: '/kontak', label: 'Kontak' },
]

export default function PublicLayout() {
  const [open, setOpen] = useState(false)
  const { data: info } = useFetch<ContactInfo>('/contact-info')
  const cls = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium ${isActive ? 'text-brand-600' : 'text-slate-600 hover:text-ink'}`
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-ink">
            <img src="/logo.png" alt="" className="h-9 w-auto" />
            <span>Sagala<span className="text-brand-600">Tech</span></span>
          </Link>
          <nav className="hidden gap-8 md:flex">
            {links.map((l) => (
              <NavLink key={l.to} {...l} className={cls}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <button className="md:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>
            ☰
          </button>
        </div>
        {open && (
          <nav className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 md:hidden" onClick={() => setOpen(false)}>
            {links.map((l) => (
              <NavLink key={l.to} {...l} className={cls}>
                {l.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-white/10 bg-night text-slate-300">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
          <div>
            <p className="text-lg font-bold text-white">SagalaTech</p>
            <p className="mt-2 text-sm">Penyedia jasa teknologi: CCTV, jaringan, servis perangkat keras, pengadaan barang, dan pembuatan sistem, website, serta aplikasi.</p>
          </div>
          <div className="text-sm">
            <p className="font-semibold text-white">Navigasi</p>
            <ul className="mt-2 space-y-1">
              {links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-white">Kontak</p>
            {info?.email && <p>{info.email}</p>}
            {info?.phone && <p>{info.phone}</p>}
            {info?.address && <p>{info.address}</p>}
          </div>
        </div>
        <p className="border-t border-white/10 py-4 text-center text-xs">
          © {new Date().getFullYear()} Sagala Tech. Seluruh hak cipta dilindungi.
        </p>
      </footer>
    </div>
  )
}
