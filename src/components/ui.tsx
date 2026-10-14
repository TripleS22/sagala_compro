import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'

export function Button({
  variant = 'primary',
  className = '',
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }) {
  const styles = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700',
    ghost: 'border border-slate-300 text-slate-700 hover:bg-slate-50',
    danger: 'border border-red-200 text-red-600 hover:bg-red-50',
  }[variant]
  return (
    <button
      {...p}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${styles} ${className}`}
    />
  )
}

const field =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

export function Field({
  label,
  textarea,
  ...p
}: { label: string; textarea?: boolean } & InputHTMLAttributes<HTMLInputElement> &
  TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {textarea ? <textarea {...p} className={field} /> : <input {...p} className={field} />}
    </label>
  )
}

export function Alert({ kind = 'error', children }: { kind?: 'error' | 'ok'; children: ReactNode }) {
  const c = kind === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
  return <div className={`rounded-lg px-3 py-2 text-sm ${c}`}>{children}</div>
}

export const Loading = () => <p className="py-12 text-center text-slate-500">Memuat…</p>
