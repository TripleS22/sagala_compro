import SpotlightCard from '@/components/SpotlightCard'
import Reveal from '@/components/Reveal'
import { services } from '@/lib/content'

/** Grid 3 kolom dengan garis tipis (tanpa kartu membulat); sorot kursor halus saat hover. */
export default function ServiceGrid({ detailed = false }: { detailed?: boolean }) {
  return (
    <div className="grid border-t border-l border-slate-200 md:grid-cols-2 lg:grid-cols-3">
      {services.map(({ icon: Icon, ...s }, i) => (
        <Reveal key={s.title} delay={(i % 3) * 0.08} distance={20} className="border-r border-b border-slate-200">
          <SpotlightCard
            theme="light"
            intensity={0.12}
            spotlightSize={280}
            borderGlow={0}
            spotlightColor="#016aaa"
            className="h-full rounded-none! p-7! shadow-none! !bg-white"
          >
            <div className="flex items-start justify-between">
              <span className="font-mono text-xs text-slate-400">{String(i + 1).padStart(2, '0')}</span>
              <Icon className="size-5 text-brand-600" strokeWidth={1.5} />
            </div>
            <h3 className="mt-10 text-lg font-semibold text-ink">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.desc}</p>
            {detailed && (
              <ul className="mt-5 space-y-1.5 border-t border-slate-100 pt-4 font-mono text-xs text-slate-500">
                {s.points.map((p) => (
                  <li key={p}>› {p}</li>
                ))}
              </ul>
            )}
          </SpotlightCard>
        </Reveal>
      ))}
    </div>
  )
}
