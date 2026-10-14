import { ArrowUpRight, Star } from 'lucide-react'
import { type Project, formatDate } from '@/lib/api'
import { categories } from '@/lib/content'

function Placeholder({ project }: { project: Project }) {
  return (
    <div className="bg-night relative flex aspect-[16/10] w-full items-end overflow-hidden p-4">
      <div className="bg-grid absolute inset-0" />
      <p className="relative font-mono text-xs text-sky-300">{project.repo ?? categories[project.category]}</p>
    </div>
  )
}

export default function ProjectCard({ project: p }: { project: Project }) {
  return (
    <article className="group flex h-full flex-col border border-slate-200 bg-white transition hover:border-brand-500/60">
      {p.image ? <img src={p.image} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover" /> : <Placeholder project={p} />}
      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-xs tracking-widest text-brand-600 uppercase">{categories[p.category] ?? p.category}</p>
        <h3 className="mt-2 text-lg font-semibold text-ink">{p.title}</h3>
        {p.summary && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">{p.summary}</p>}
        {p.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {p.tags.map((t) => (
              <li key={t} className="border border-slate-200 px-2 py-0.5 font-mono text-[11px] text-slate-600">{t}</li>
            ))}
          </ul>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-5 text-sm">
          {p.demo_url && (
            <a href={p.demo_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-brand-600 hover:underline">
              Lihat demo <ArrowUpRight className="size-3.5" />
            </a>
          )}
          {p.repo_url && (
            <a href={p.repo_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-slate-700 hover:text-brand-600">
              Kode <ArrowUpRight className="size-3.5" />
            </a>
          )}
          {p.repo && (
            <span className="ml-auto inline-flex items-center gap-1 font-mono text-xs text-slate-500" title={p.pushed_at ? `Diperbarui ${formatDate(p.pushed_at.replace('T', ' ').replace('Z', ''))}` : undefined}>
              <Star className="size-3.5" /> {p.stars}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
