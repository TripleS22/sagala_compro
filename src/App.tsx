import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AdminLayout from '@/components/AdminLayout'
import PublicLayout from '@/components/PublicLayout'
import About from '@/pages/About'
import ArticleDetail from '@/pages/ArticleDetail'
import Articles from '@/pages/Articles'
import Contact from '@/pages/Contact'
import Home from '@/pages/Home'
import Services from '@/pages/Services'
import ArticleEditor from '@/pages/admin/ArticleEditor'
import ArticleList from '@/pages/admin/ArticleList'
import ContactSettings from '@/pages/admin/ContactSettings'
import Login from '@/pages/admin/Login'
import Messages from '@/pages/admin/Messages'

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  )
}
