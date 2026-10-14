import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import PublicLayout from '@/components/PublicLayout'
import { Loading } from '@/components/ui'
import About from '@/pages/About'
import ArticleDetail from '@/pages/ArticleDetail'
import Articles from '@/pages/Articles'
import Contact from '@/pages/Contact'
import Home from '@/pages/Home'
import Services from '@/pages/Services'

// Panel admin dimuat terpisah agar halaman publik tetap ringan
const AdminLayout = lazy(() => import('@/components/AdminLayout'))
const ArticleEditor = lazy(() => import('@/pages/admin/ArticleEditor'))
const ArticleList = lazy(() => import('@/pages/admin/ArticleList'))
const ContactSettings = lazy(() => import('@/pages/admin/ContactSettings'))
const Login = lazy(() => import('@/pages/admin/Login'))
const Messages = lazy(() => import('@/pages/admin/Messages'))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="tentang" element={<About />} />
            <Route path="layanan" element={<Services />} />
            <Route path="artikel" element={<Articles />} />
            <Route path="artikel/:slug" element={<ArticleDetail />} />
            <Route path="kontak" element={<Contact />} />
          </Route>
          <Route path="admin/login" element={<Login />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<ArticleList />} />
            <Route path="artikel/baru" element={<ArticleEditor />} />
            <Route path="artikel/:id" element={<ArticleEditor />} />
            <Route path="kontak" element={<ContactSettings />} />
            <Route path="pesan" element={<Messages />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
