import { useState } from 'react'
import PageHeader from '@/components/PageHeader'
import ProjectCard from '@/components/ProjectCard'
import Reveal from '@/components/Reveal'
import { Loading } from '@/components/ui'
import { type Project, useFetch } from '@/lib/api'
import { categories } from '@/lib/content'

export default function Projects() {
  const { data, loading, error } = useFetch<Project[]>('/projects')
  const [filter, setFilter] = useState('semua')
  const present = Object.keys(categories).filter((c) => data?.some((p) => p.category === c))
  const shown = data?.filter((p) => filter === 'semua' || p.category === filter)

  return (
    <>
      <PageHeader no="02" label="Proyek" title="Karya dan proyek yang pernah kami kerjakan">
        Sistem dan aplikasi yang kami bangun, serta pekerjaan lapangan lainnya.
      </PageHeader>
      <div className="mx-auto max-w-6xl px-4 py-16">
        {loading && <Loading />}
        {error && <p className="text-red-600">{error}</p>}
        {data?.length === 0 && <p>Proyek akan segera ditampilkan.</p>}
        {present.length > 1 && (
          <div className="mb-10 flex flex-wrap gap-2" role="tablist" aria-label="Filter kategori">
            {['semua', ...present].map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={filter === c}
                onClick={() => setFilter(c)}
                className={`border px-3 py-1.5 font-mono text-xs tracking-wider uppercase transition ${filter === c ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 text-slate-600 hover:border-brand-500'}`}
              >
                {c === 'semua' ? 'Semua' : categories[c]}
              </button>
            ))}
          </div>
        )}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {shown?.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 0.08} distance={20}>
              <ProjectCard project={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </>
  )
}
