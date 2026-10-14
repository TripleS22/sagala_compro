import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Loading } from '@/components/ui'
import { api, send } from '@/lib/api'

export default function AdminLayout() {
  const nav = useNavigate()
  const [user, setUser] = useState<string | null>(null)

  useEffect(() => {
    api<{ username: string }>('/auth/me')
      .then((u) => setUser(u.username))
      .catch(() => nav('/admin/login', { replace: true }))
  }, [nav])

  if (!user) return <Loading />

  const cls = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="border-b border-slate-200 bg-white p-4 md:min-h-screen md:w-60 md:border-r md:border-b-0">
        <p className="mb-4 flex items-center gap-2 text-lg font-bold text-ink"><img src="/logo.png" alt="" className="h-7 w-auto" />Admin <span className="text-brand-600">Panel</span></p>
        <nav className="flex gap-1 md:flex-col">
          <NavLink to="/admin" end className={cls}>Artikel</NavLink>
          <NavLink to="/admin/proyek" className={cls}>Proyek</NavLink>
          <NavLink to="/admin/kontak" className={cls}>Info Kontak</NavLink>
          <NavLink to="/admin/pesan" className={cls}>Pesan Masuk</NavLink>
        </nav>
        <div className="mt-6 border-t border-slate-100 pt-4 text-sm">
          <p className="text-slate-500">Masuk sebagai {user}</p>
          <button
            className="mt-2 text-red-600"
            onClick={async () => {
              await send('POST', '/auth/logout')
              nav('/admin/login')
            }}
          >
            Keluar
          </button>
          <a href="/" className="mt-2 block text-brand-600">Lihat website ↗</a>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  )
}
