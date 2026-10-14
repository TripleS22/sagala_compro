import { type FormEvent, useEffect, useState } from 'react'
import { Alert, Button, Field, Loading } from '@/components/ui'
import { type ContactInfo, send, useFetch } from '@/lib/api'

const fields: [keyof ContactInfo, string][] = [
  ['email', 'Email'],
  ['phone', 'Telepon'],
  ['whatsapp', 'WhatsApp (contoh: 6281234567890)'],
  ['address', 'Alamat'],
  ['hours', 'Jam operasional'],
  ['maps_url', 'Link Google Maps'],
]

export default function ContactSettings() {
  const { data, loading } = useFetch<ContactInfo>('/contact-info')
  const [form, setForm] = useState<ContactInfo | null>(null)
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)

  useEffect(() => setForm(data), [data])

  async function submit(e: FormEvent) {
    e.preventDefault()
    try {
      await send('PUT', '/admin/contact-info', form)
      setStatus({ kind: 'ok', text: 'Info kontak disimpan.' })
    } catch (err) {
      setStatus({ kind: 'error', text: (err as Error).message })
    }
  }

  if (loading || !form) return <Loading />
  return (
    <form onSubmit={submit} className="max-w-xl space-y-4">
      <h1 className="text-2xl font-bold text-ink">Info Kontak</h1>
      <p className="text-sm">Ditampilkan di halaman Kontak dan footer website.</p>
      {fields.map(([k, label]) => (
        <Field key={k} label={label} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
      ))}
      {status && <Alert kind={status.kind}>{status.text}</Alert>}
      <Button>Simpan</Button>
    </form>
  )
}
