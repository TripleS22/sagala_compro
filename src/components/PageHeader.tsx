import type { ReactNode } from 'react'
import Eyebrow from '@/components/Eyebrow'

export default function PageHeader({ no, label, title, children }: { no: string; label: string; title: string; children?: ReactNode }) {
  return (
    <header className="relative isolate overflow-hidden bg-night text-white">
      <div className="bg-grid absolute inset-0 -z-10" />
      <div className="absolute -top-32 right-0 -z-10 size-96 rounded-full bg-brand-600/30 blur-3xl" />
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <Eyebrow no={no} dark>{label}</Eyebrow>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
        {children && <p className="mt-4 max-w-2xl text-white/70">{children}</p>}
      </div>
    </header>
  )
}
