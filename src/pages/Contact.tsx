import { type FormEvent, useState } from 'react'
import PageHeader from '@/components/PageHeader'
import { Alert, Button, Field } from '@/components/ui'
import { type ContactInfo, send, useFetch } from '@/lib/api'

export default function Contact() {
  const { data: info } = useFetch<ContactInfo>('/contact-info')
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const body = Object.fromEntries(new FormData(form))
    setBusy(true)
    try {
      await send('POST', '/messages', body)
      form.reset()
      setStatus({ kind: 'ok', text: 'Terima kasih! Pesan Anda sudah terkirim, kami akan segera menghubungi Anda.' })
    } catch (err) {
      setStatus({ kind: 'error', text: (err as Error).message })
    } finally {
      setBusy(false)
    }
  }

  const wa = info?.whatsapp.replace(/\D/g, '')
  return (
    <>
    <PageHeader no="05" label="Kontak" title="Hubungi kami">Ceritakan kebutuhan Anda, tim kami akan membalas secepatnya.</PageHeader>
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-2">
      <div>
        <dl className="mt-8 space-y-4 text-sm">
          {info?.email && <Row label="Email"><a href={`mailto:${info.email}`}>{info.email}</a></Row>}
          {info?.phone && <Row label="Telepon"><a href={`tel:${info.phone}`}>{info.phone}</a></Row>}
          {wa && <Row label="WhatsApp"><a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">{info?.whatsapp}</a></Row>}
          {info?.address && <Row label="Alamat">{info.address}</Row>}
          {info?.hours && <Row label="Jam Operasional">{info.hours}</Row>}
          {info?.maps_url?.startsWith('http') && (
            <Row label="Peta"><a href={info.maps_url} target="_blank" rel="noreferrer">Buka di Google Maps</a></Row>
          )}
        </dl>
      </div>
      <form onSubmit={submit} className="space-y-4 border border-slate-200 p-6">
        <Field label="Nama" name="name" required minLength={2} maxLength={100} />
        <Field label="Email" name="email" type="email" required />
        <Field label="Subjek" name="subject" maxLength={200} />
        <Field label="Pesan" name="body" textarea rows={5} required minLength={10} maxLength={5000} />
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        {status && <Alert kind={status.kind}>{status.text}</Alert>}
        <Button disabled={busy} className="w-full">{busy ? 'Mengirim…' : 'Kirim Pesan'}</Button>
      </form>
    </div>
    </>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-mono text-xs tracking-widest text-slate-500 uppercase">{label}</dt>
      <dd className="text-brand-700">{children}</dd>
    </div>
  )
}
